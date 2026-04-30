import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getCoverImageUrlsByListingId } from "$lib/server/listing-images";

const PLACEHOLDER_IMAGE = "/listing-placeholder.png";

function resolveListingImage(url: string | null | undefined) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : PLACEHOLDER_IMAGE;
}

function isPlaceholderImage(url: string | null | undefined) {
  return !url?.trim();
}

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.accountType !== "landlord" || !locals.user) return redirect(307, "/");

  const { data, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("landlord", locals.user.id);

  // TODO: propagate this as a displayed error message
  if (error) {
    console.log("[error] failed to fetch listings for landlord");
    return { listings: [] }
  }

  const listingIds = (data ?? [])
    .map((listing) => listing.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  let coverUrlByListingId = new Map<string, string>();

  try {
    coverUrlByListingId = await getCoverImageUrlsByListingId(locals.supabase, listingIds);
  } catch (imagesError) {
    console.error(imagesError);
  }

  return {
    listings: (data ?? []).map((listing) => {
      const coverImageUrl = coverUrlByListingId.get(listing.id);

      return {
        ...listing,
        imageSrc: resolveListingImage(coverImageUrl),
        isPlaceholder: isPlaceholderImage(coverImageUrl),
      };
    })
  };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    // TODO: respond with an error code
    if (!locals.user) return;

    const listingId = await request.text();
    const { data, error } = await locals.supabase
      .from("listings")
      .delete()
      .eq("landlord", locals.user.id)
      .eq("id", listingId);
    
    if (error) {
      // TODO: propagate error
    }
  },
};
