import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getCoverImageUrlsByListingId } from "$lib/server/listing-images";

export type Listing = {
  id: string;
  title: string | null;
  baths: number | null;
  beds: number | null;
  address: string | null;
  img: string | null;
  distance_from_campus_mi: number | null;
};

const parseFilterNumber = (value: string | null) => {
  if (value == null || value === "") return 0;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;

  return parsed;
};

const escapeIlikePattern = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll(",", "\\,")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");
  if (!locals.user) return redirect(303, "/login");

  const search = url.searchParams.get("search")?.trim() ?? "";
  const baths = parseFilterNumber(url.searchParams.get("baths"));
  const beds = parseFilterNumber(url.searchParams.get("beds"));
  const maxMiles = parseFilterNumber(url.searchParams.get("maxMiles"));

  const { data: tenantRow, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("favorite_houses")
    .eq("id", locals.user.id)
    .single();
  const message = tenantError ? tenantError.message : undefined;
  if (tenantError) console.error(tenantError);
  const favoriteIds = ((tenantRow?.favorite_houses ?? []) as string[]).filter(Boolean);

  let listingQuery = locals.supabase
    .from("listings")
    .select("id, title, baths, beds, address, distance_from_campus_mi")
    .limit(60);
    // TODO: technically we should have pagination or infinite scroll if we limit, but alas...

  if (search) {
    const escapedSearch = escapeIlikePattern(search);
    listingQuery = listingQuery.or(`title.ilike.%${escapedSearch}%,address.ilike.%${escapedSearch}%`);
  }
  if (baths > 0) listingQuery = listingQuery.eq("baths", baths);
  if (beds > 0) listingQuery = listingQuery.eq("beds", beds);
  if (maxMiles > 0) listingQuery = listingQuery.lte("distance_from_campus_mi", maxMiles);

  const { data: listingRows, error: listingError } = await listingQuery;
  if (listingError) {
    console.error(listingError);
    return {
      listings: [] as Listing[],
      favoriteIds,
      message,
      filters: { search, baths, beds, maxMiles }
    };
  }

  const listingsObj = listingRows ?? [];
  const listingIds = listingsObj.map((listingElem) => listingElem.id).filter((id): id is string => id != null);

  let coverUrlByListingId = new Map<string, string>();

  try {
    coverUrlByListingId = await getCoverImageUrlsByListingId(locals.supabase, listingIds);
  } catch (imagesError) {
    console.error(imagesError);
  }

  const listings: Listing[] = listingsObj.map((row) => ({
    id: row.id,
    title: row.title,
    baths: row.baths,
    beds: row.beds,
    address: row.address,
    img: coverUrlByListingId.get(row.id) ?? null,
    distance_from_campus_mi: row.distance_from_campus_mi ?? null
  }));
  return {
    listings,
    favoriteIds,
    message,
    filters: { search, baths, beds, maxMiles }
  };
};

export const actions: Actions = {
  toggleFavorite: async ({ request, locals, url }) => {
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

    return redirect(303, `${url.pathname}${url.search}`);
  }
};
