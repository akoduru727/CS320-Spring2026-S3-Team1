import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getCoverImageUrlsByListingId } from "$lib/server/listing-images";

/** Served from `static/listing-placeholder.png` */
const PLACEHOLDER_IMAGE = "/listing-placeholder.png";

function resolveListingImage(url: string | null | undefined) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : PLACEHOLDER_IMAGE;
}

function isPlaceholderImage(url: string | null | undefined) {
  return !url?.trim();
}

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");
  if (!locals.user) return redirect(303, "/login");

  const { data: tenantRow, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("favorite_houses")
    .eq("id", locals.user.id)
    .single();
  if (tenantError) {
    console.error(tenantError);
    return { favorites: [], message: tenantError.message };
  }

  const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];
  if (favoriteIds.length === 0) return { favorites: [] };

  const { data: listingRows, error: listingError } = await locals.supabase
    .from("listings")
    .select()
    .in("id", favoriteIds);
  if (listingError) {
    console.error(listingError);
    return { favorites: [], message: listingError.message };
  }

  const order = new Map(favoriteIds.map((id, i) => [id, i]));
  const listings = (listingRows ?? []).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );

  const listingIds = listings
    .map((listing) => listing.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  let coverUrlByListingId = new Map<string, string>();

  try {
    coverUrlByListingId = await getCoverImageUrlsByListingId(locals.supabase, listingIds);
  } catch (imagesError) {
    console.error(imagesError);
  }

  return {
    favorites: listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      address: listing.address,
      distanceFromCampusMi: listing.distance_from_campus_mi ?? 0,
      imageSrc: resolveListingImage(coverUrlByListingId.get(listing.id)),
      isPlaceholder: isPlaceholderImage(coverUrlByListingId.get(listing.id)),
    }))
  };
};

export const actions: Actions = {
  remove: async ({ request, locals, url }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");
    const formData = await request.formData();
    const listingId = formData.get("id");
    if (typeof listingId !== "string" || !listingId) return;

    const { data: tenantRow, error: tenantError } = await locals.supabase
      .from("tenants")
      .select("favorite_houses")
      .eq("id", locals.user.id)
      .single();
    if (tenantError) {
      console.error(tenantError);
      return fail(500, { message: tenantError.message });
    }

    const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];
    const nextFavorites = favoriteIds.filter((id) => id !== listingId);

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
