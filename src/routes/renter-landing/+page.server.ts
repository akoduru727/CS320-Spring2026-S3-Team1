import type { PageServerLoad } from "./$types";

export type Listing = {
  title: string | null;
  baths: number | null;
  beds: number | null;
  address: string | null;
  img: string | null;
  distanceFromCampusMi: number | null;
};

const COVER_TAG = "cover picture";

export const load: PageServerLoad = async ({ locals }) => {
  const { data: listingRows, error: listingError } = await locals.supabase
    .from("listings")
    .select("id, title, baths, beds, address");
  if (listingError) {
    console.error(listingError);
    return { listings: [] as Listing[] };
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
    title: row.title,
    baths: row.baths,
    beds: row.beds,
    address: row.address,
    img: coverUrlByListingId.get(row.id) ?? null,
    distanceFromCampusMi: null //need to figure this out later how we calculate distance
  }));
  return { listings };
};
