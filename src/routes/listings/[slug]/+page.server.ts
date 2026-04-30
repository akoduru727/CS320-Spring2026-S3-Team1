import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getListingImages, type ListingImage } from "$lib/server/listing-images";

const isMissingApplicationsTable = (message: string | undefined) => {
  const lower = (message ?? "").toLowerCase();
  return lower.includes("could not find the table") && lower.includes("applications");
};

export const load: PageServerLoad = async ({ locals, params }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");
  if (!locals.user) return redirect(303, "/login");

  const { data, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("id", params.slug)
    .single();

  if (error) return redirect(303, "/");

  const { data: tenantRow, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("favorite_houses")
    .eq("id", locals.user.id)
    .single();
  if (tenantError) console.error(tenantError);
  const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];

  let listingImages: ListingImage[] = [];

  try {
    listingImages = await getListingImages(locals.supabase, params.slug);
  } catch (imagesError) {
    console.error(imagesError);
  }

  return {
    listing: data,
    listingImages,
    isFavorite: favoriteIds.includes(params.slug),
  };
};

export const actions: Actions = {
  apply: async ({ locals, params }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const listingId = params.slug;
    const { data: listingRow, error: listingError } = await locals.supabase
      .from("listings")
      .select("id, landlord")
      .eq("id", listingId)
      .single();

    if (listingError || !listingRow) {
      console.error(listingError);
      return fail(404, { message: "Listing not found." });
    }

    const landlordId = listingRow.landlord as string | null;
    if (!landlordId) return fail(500, { message: "Listing is missing landlord information." });

    const { error: insertError } = await locals.supabase.from("applications").insert({
      listing: listingId,
      tenant: locals.user.id,
      landlord: landlordId,
      status: "pending",
      message: null,
    });

    if (insertError) {
      console.error(insertError);
      if (isMissingApplicationsTable(insertError.message)) {
        return fail(500, {
          message: "Applications table is not set up yet. Run `scripts/supabase-applications.sql` in Supabase SQL editor.",
        });
      }
      return fail(500, { message: insertError.message });
    }

    return redirect(303, "/application-portal");
  },
  toggleFavorite: async ({ locals, params, url }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const { data: tenantRow, error: tenantError } = await locals.supabase
      .from("tenants")
      .select("favorite_houses")
      .eq("id", locals.user.id)
      .single();
    if (tenantError) {
      console.error(tenantError);
      return fail(500, { message: tenantError.message });
    }

    const listingId = params.slug;
    const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];
    const isCurrentlyFavorite = favoriteIds.includes(listingId);
    const nextFavorites = isCurrentlyFavorite
      ? favoriteIds.filter((id) => id !== listingId)
      : [...favoriteIds, listingId];

    const { data: updatedTenant, error: updateError } = await locals.supabase
      .from("tenants")
      .update({ favorite_houses: nextFavorites })
      .eq("id", locals.user.id)
      .select("favorite_houses")
      .single();
    if (updateError) {
      console.error(updateError);
      return fail(500, { message: updateError.message });
    }
    if (!updatedTenant) return fail(500, { message: "Favorite update failed (no row returned)." });

    return redirect(303, url.pathname);
  }
};
