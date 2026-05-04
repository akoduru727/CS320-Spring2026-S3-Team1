import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getListingImages, type ListingImage } from "$lib/server/listing-images";
import {
  ensureListingCover,
  geocodeDistanceFromCampus,
  parseListingForm,
  uploadApplicationPdf,
  uploadListingImages,
} from "$lib/server/listing-form";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) return redirect(303, "/login");
  if (locals.accountType !== "landlord") return redirect(303, "/");

  const { data: listing, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("id", params.slug)
    .eq("landlord", locals.user.id)
    .maybeSingle();

  if (error || !listing) return redirect(303, "/dashboard");

  let listingImages: ListingImage[] = [];

  try {
    listingImages = await getListingImages(locals.supabase, params.slug);
  } catch (imagesError) {
    console.error(imagesError);
  }

  return { listing, listingImages };
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");
    if (locals.accountType !== "landlord") {
      return fail(403, { message: "Only landlords can edit listings." });
    }

    const { data: existingListing, error: listingError } = await locals.supabase
      .from("listings")
      .select()
      .eq("id", params.slug)
      .eq("landlord", user.id)
      .maybeSingle();

    if (listingError || !existingListing) {
      return fail(404, { message: "Listing not found." });
    }

    const formData = await request.formData();
    const requirePdfUpload =
      formData.get("application_type") === "pdf" && !existingListing.application_pdf_url;
    const parsed = parseListingForm(formData, { requirePdfUpload });
    if (!parsed.data) {
      return fail(400, { message: parsed.message ?? "Invalid form submission." });
    }

    let distanceFromCampus = existingListing.distance_from_campus_mi;
    const addressChanged =
      parsed.data.address !== existingListing.address ||
      parsed.data.city !== existingListing.city ||
      parsed.data.zipCode !== existingListing.zip_code;

    if (addressChanged) {
      const geocoded = await geocodeDistanceFromCampus(
        parsed.data.address,
        parsed.data.city,
        parsed.data.zipCode,
      );

      if (geocoded.message || geocoded.distance === null) {
        return fail(500, { message: geocoded.message ?? "Geocoding Error" });
      }

      distanceFromCampus = geocoded.distance;
    }

    let pdfUrl: string | null = null;
    if (parsed.data.applicationType === "pdf") {
      pdfUrl = existingListing.application_pdf_url;

      if (parsed.data.applicationPdfFile) {
        const pdfUpload = await uploadApplicationPdf(locals.supabase, user.id, parsed.data.applicationPdfFile);
        if (pdfUpload.message) {
          return fail(500, { message: pdfUpload.message });
        }
        pdfUrl = pdfUpload.url;
      }
    }

    const payload = {
      address: parsed.data.address,
      city: parsed.data.city,
      zip_code: parsed.data.zipCode,
      beds: parsed.data.beds,
      baths: parsed.data.baths,
      area: parsed.data.area,
      price: parsed.data.price,
      available_from: parsed.data.availableFrom,
      available_to: parsed.data.availableTo,
      utility: parsed.data.utility,
      parking: parsed.data.parking,
      furnished: parsed.data.furnished,
      title: parsed.data.title,
      description: parsed.data.description,
      distance_from_campus_mi: distanceFromCampus,
      application_type: parsed.data.applicationType,
      contact_email: parsed.data.contactEmail,
      contact_phone: parsed.data.contactPhone,
      application_pdf_url: pdfUrl,
    };

    const { error: updateError } = await locals.supabase
      .from("listings")
      .update(payload)
      .eq("id", params.slug)
      .eq("landlord", user.id);

    if (updateError) {
      return fail(500, { message: `Unexpected error: ${updateError.message}.` });
    }

    if (parsed.data.removeImageIds.length > 0) {
      const { data: imagesToRemove, error: imagesToRemoveError } = await locals.supabase
        .from("images")
        .select("id, storage_path")
        .eq("listing", params.slug)
        .in("id", parsed.data.removeImageIds);

      if (imagesToRemoveError) {
        return fail(500, { message: `Unexpected error: ${imagesToRemoveError.message}.` });
      }

      const storagePaths = (imagesToRemove ?? [])
        .map((image) => image.storage_path as string | null)
        .filter((path): path is string => Boolean(path));

      if (storagePaths.length > 0) {
        const { error: storageError } = await locals.supabase.storage
          .from("listing_images")
          .remove(storagePaths);

        if (storageError) {
          return fail(500, { message: `Unexpected error: ${storageError.message}.` });
        }
      }

      const { error: deleteImagesError } = await locals.supabase
        .from("images")
        .delete()
        .eq("listing", params.slug)
        .in("id", parsed.data.removeImageIds);

      if (deleteImagesError) {
        return fail(500, { message: `Unexpected error: ${deleteImagesError.message}.` });
      }
    }

    if (
      parsed.data.coverImageId &&
      !parsed.data.removeImageIds.includes(parsed.data.coverImageId)
    ) {
      const { error: clearCoverError } = await locals.supabase
        .from("images")
        .update({ cover: false })
        .eq("listing", params.slug);

      if (clearCoverError) {
        return fail(500, { message: `Unexpected error: ${clearCoverError.message}.` });
      }

      const { error: setCoverError } = await locals.supabase
        .from("images")
        .update({ cover: true })
        .eq("listing", params.slug)
        .eq("id", parsed.data.coverImageId);

      if (setCoverError) {
        return fail(500, { message: `Unexpected error: ${setCoverError.message}.` });
      }
    }

    const { count: remainingImagesCount, error: remainingImagesError } = await locals.supabase
      .from("images")
      .select("id", { count: "exact", head: true })
      .eq("listing", params.slug);

    if (remainingImagesError) {
      return fail(500, { message: `Unexpected error: ${remainingImagesError.message}.` });
    }

    const imagesUpload = await uploadListingImages(
      locals.supabase,
      user.id,
      params.slug,
      parsed.data.imageFiles,
      (remainingImagesCount ?? 0) === 0,
    );

    if (imagesUpload.message) {
      return fail(500, { message: imagesUpload.message });
    }

    const coverResult = await ensureListingCover(locals.supabase, params.slug);
    if (coverResult.message) {
      return fail(500, { message: coverResult.message });
    }

    return redirect(303, "/dashboard");
  },
};
