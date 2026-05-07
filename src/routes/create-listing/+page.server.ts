import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
  geocodeDistanceFromCampus,
  parseListingForm,
  uploadApplicationPdf,
  uploadListingImages,
} from "$lib/server/listing-form";

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    if (locals.accountType !== "landlord") {
      return fail(403, { message: "Only landlords can create listings." });
    }

    const formData = await request.formData();
    const parsed = parseListingForm(formData, { requirePdfUpload: true });
    if (!parsed.data) {
      return fail(400, { message: parsed.message ?? "Invalid form submission." });
    }
    if (!Number.isInteger(priceResult.value) || priceResult.value <= 0) {
      return fail(400, { message: "Price has to be a positive whole number." });
    }

    const geocoded = await geocodeDistanceFromCampus(
      parsed.data.address,
      parsed.data.city,
      parsed.data.zipCode,
    );

    if (geocoded.message || geocoded.distance === null) {
      return fail(500, { message: geocoded.message ?? "Geocoding Error" });
    }

    let pdfUrl: string | null = null;
    if (parsed.data.applicationType === "pdf" && parsed.data.applicationPdfFile) {
      const pdfUpload = await uploadApplicationPdf(locals.supabase, user.id, parsed.data.applicationPdfFile);
      if (pdfUpload.message) {
        return fail(500, { message: pdfUpload.message });
      }
      pdfUrl = pdfUpload.url;
    }

    const payload = {
      landlord: user.id,
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
      status: "Vacant",
      distance_from_campus_mi: geocoded.distance,
      application_type: parsed.data.applicationType,
      contact_email: parsed.data.contactEmail,
      contact_phone: parsed.data.contactPhone,
      application_pdf_url: pdfUrl,
    };

    const { data: listing, error } = await locals.supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return fail(500, { message: `Unexpected error: ${error.message}.` });
    }

    const imagesUpload = await uploadListingImages(
      locals.supabase,
      user.id,
      listing.id,
      parsed.data.imageFiles,
      true,
    );

    if (imagesUpload.message) {
      return fail(500, { message: imagesUpload.message });
    }

    return redirect(303, "/dashboard");
  },
};
