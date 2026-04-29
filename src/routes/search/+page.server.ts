import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type Listing = {
  id: string;
  title: string | null;
  baths: number | null;
  beds: number | null;
  address: string | null;
  img: string | null;
  distance_from_campus_mi: number | null;
  application_type: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  application_pdf_url: string | null;
  landlord: string;
};

const COVER_TAG = "cover picture";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");
  if (!locals.user) return redirect(303, "/login");

  const { data: tenantRow, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("favorite_houses")
    .eq("id", locals.user.id)
    .single();
  const message = tenantError ? tenantError.message : undefined;
  if (tenantError) console.error(tenantError);
  const favoriteIds = ((tenantRow?.favorite_houses ?? []) as string[]).filter(Boolean);

  const { data: listingRows, error: listingError } = await locals.supabase
    .from("listings")
    .select("id, title, baths, beds, address, distance_from_campus_mi, application_type, contact_email, contact_phone, application_pdf_url, landlord");
  if (listingError) {
    console.error(listingError);
    return { listings: [] as Listing[], favoriteIds, message };
  }

  const listingsObj = listingRows ?? [];
  const listingIds = listingsObj.map((listingElem) => listingElem.id).filter((id): id is string => id != null);

  const coverUrlByListingId = new Map<string, string>();

  if(listingIds.length > 0){
    const {data: imageRows, error: imagesError} = await locals.supabase
      .from("images")
      .select("listing, url, tag")
      .eq("tag", COVER_TAG)
      .in("listing", listingIds);

    if(imagesError){
      console.error(imagesError);
    } 
    else {
      for (const img of imageRows ?? []) {
        const imgListingId = img.listing as string | null;
        if (imgListingId != null && !coverUrlByListingId.has(imgListingId)) {
          coverUrlByListingId.set(imgListingId, img.url as string);
        }
      }
    }
  }

  const listings: Listing[] = listingsObj.map((row) => ({
    id: row.id,
    title: row.title,
    baths: row.baths,
    beds: row.beds,
    address: row.address,
    img: coverUrlByListingId.get(row.id) ?? null,
    distance_from_campus_mi: row.distance_from_campus_mi ?? null, //need to figure this out later how we calculate distance
    application_type: row.application_type,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    application_pdf_url: row.application_pdf_url,
    landlord: row.landlord
  }));

  const { data: applicationRows, error: appError } = await locals.supabase
    .from("applications")
    .select("listing")
    .eq("tenant", locals.user.id);

  if (appError) {
    console.error(appError);
  }
  const appliedIds = new Set((applicationRows ?? []).map((a) => a.listing));

  return { listings, favoriteIds, appliedIds, message };
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

    return redirect(303, url.pathname);
  }
};
