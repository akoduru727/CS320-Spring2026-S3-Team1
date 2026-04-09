import type { PageServerLoad } from "./$types";

/** Served from `static/listing-placeholder.png` */
const PLACEHOLDER_IMAGE = "/listing-placeholder.png";

type FavoriteListing = {
  address: string;
  distanceFromCampusMi: number;
  description: string;
  imageUrl?: string | null;
};

const favorites: FavoriteListing[] = [
  {
    address: "26 Spring Street",
    distanceFromCampusMi: 4,
    description:
      "Spacious apartment with natural light and a short commute to campus."
  },
  {
    address: "11 East Pleasant",
    distanceFromCampusMi: 5,
    description:
      "Modern unit close to restaurants, study spaces, and bus routes."
  },
  {
    address: "42 Riverwalk Drive",
    distanceFromCampusMi: 3,
    description:
      "Quiet neighborhood option with updated kitchen and in-unit laundry."
  },
  {
    address: "42 Riverwalk Drive",
    distanceFromCampusMi: 3,
    description:
      "Quiet neighborhood option with updated kitchen and in-unit laundry."
  },
  {
    address: "42 Riverwalk Drive",
    distanceFromCampusMi: 3,
    description:
      "Quiet neighborhood option with updated kitchen and in-unit laundry."
  }
];

function resolveListingImage(url: string | null | undefined) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : PLACEHOLDER_IMAGE;
}

function isPlaceholderImage(url: string | null | undefined) {
  return !url?.trim();
}

export const load: PageServerLoad = async () => {
  return {
    favorites: favorites.map((listing) => ({
      address: listing.address,
      distanceFromCampusMi: listing.distanceFromCampusMi,
      description: listing.description,
      imageSrc: resolveListingImage(listing.imageUrl),
      isPlaceholder: isPlaceholderImage(listing.imageUrl)
    }))
  };
};
