import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getListingImages } from "$lib/server/listing-images";

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
  const { data: applications, error: appError } = await locals.supabase
    .from("applications")
    .select("listing")
    .eq("tenant", locals.user.id);

  if (appError) console.error(appError);

  const hasApplied = (applications ?? []).some(
    (a) => a.listing === params.slug
  );

  return { listing: data, isFavorite: favoriteIds.includes(params.slug), hasApplied };
  let listingImages = [];

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
  },
  
  apply: async ({ locals, params }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const { data: listing, error } = await locals.supabase
      .from("listings")
      .select("id, landlord")
      .eq("id", params.slug)
      .single();

    if (error || !listing) {
      console.error(error);
      return fail(500, { message: "Listing not found" });
    }

    const { error: insertError } = await locals.supabase
      .from("applications")
      .insert({
        tenant: locals.user.id,
        landlord: listing.landlord,
        listing: listing.id,
        status: "pending",
        message: ""
      });

    if (insertError) {
      console.error(insertError);
      return fail(500, { message: insertError.message });
    }

    return redirect(303, `/listings/${params.slug}`);
  }
};
