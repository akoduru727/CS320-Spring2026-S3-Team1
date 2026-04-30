import type { SupabaseClient } from "@supabase/supabase-js";

export type ListingImage = {
  id: string;
  listing: string;
  url: string;
  storage_path: string;
  upload_time: string;
  cover: boolean;
};

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

export async function getListingImages(
  supabase: SupabaseClient,
  listingId: string,
) {
  if (!listingId.trim()) {
    return [] as ListingImage[];
  }

  const { data: imageRows, error } = await supabase
    .from("images")
    .select("id, listing, url, storage_path, upload_time, cover")
    .eq("listing", listingId)
    .order("cover", { ascending: false })
    .order("upload_time", { ascending: true });

  if (error) {
    throw error;
  }

  return (imageRows ?? []) as ListingImage[];
}
