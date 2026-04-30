import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCoverImageUrlsByListingId(
  supabase: SupabaseClient,
  listingIds: string[],
) {
  const validListingIds = listingIds.filter((id) => id.length > 0);
  const coverUrlByListingId = new Map<string, string>();

  if (validListingIds.length === 0) {
    return coverUrlByListingId;
  }

  const { data: imageRows, error } = await supabase
    .from("images")
    .select("listing, url")
    .eq("cover", true)
    .in("listing", validListingIds);

  if (error) {
    throw error;
  }

  for (const image of imageRows ?? []) {
    const listingId = image.listing as string | null;
    const imageUrl = image.url as string | null;

    if (listingId && imageUrl && !coverUrlByListingId.has(listingId)) {
      coverUrlByListingId.set(listingId, imageUrl);
    }
  }

  return coverUrlByListingId;
}
