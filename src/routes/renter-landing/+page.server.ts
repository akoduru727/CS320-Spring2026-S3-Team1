import type { PageServerLoad } from "./$types";

export type Listing = {
  title: string;
  baths: number;
  beds: number;
  address: string;
  img: string;
  distanceFromCampusMi: number;
};

const listings: Listing[] = [
  {
    title: "House with Pool",
    baths: 3,
    beds: 2,
    address: "123 Kendrick Place",
    img: "src/lib/images/Screenshot 2026-03-09 151211.png",
    distanceFromCampusMi: 4
  },
  {
    title: "Apartment with Closet",
    baths: 1,
    beds: 1,
    address: "124 Kendrick Place",
    img: "src/lib/images/Screenshot 2026-03-09 151725.png",
    distanceFromCampusMi: 4
  },
  {
    title: "House with mountain view",
    baths: 2,
    beds: 4,
    address: "257 Amherst Road",
    img: "src/lib/images/Screenshot 2026-03-09 152754.png",
    distanceFromCampusMi: 3
  },
  {
    title: "Townhouse with Pool",
    baths: 2,
    beds: 2,
    address: "438 Amherst Plaza",
    img: "src/lib/images/Screenshot 2026-03-09 151129.png",
    distanceFromCampusMi: 2
  }
];

export const load: PageServerLoad = async () => {
  return { listings };
};
