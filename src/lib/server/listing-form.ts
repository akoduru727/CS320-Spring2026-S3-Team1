import { getDistance } from "geolib";
import type { SupabaseClient } from "@supabase/supabase-js";

const UMASS_COORDS = { latitude: "42.3851442", longitude: "-72.5252865" };

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
};

const parseIntField = (formData: FormData, key: string, label: string) => {
  const raw = getString(formData, key);
  if (!raw) return { value: null };
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return { error: `Invalid ${label}.` };
  return { value: parsed } as const;
};

const parseFloatField = (formData: FormData, key: string, label: string) => {
  const raw = getString(formData, key);
  if (!raw) return { value: null };
  const parsed = Number.parseFloat(raw);
  if (Number.isNaN(parsed)) return { error: `Invalid ${label}.` };
  return { value: parsed };
};

const getFileExtension = (file: File) => {
  const nameParts = file.name.split(".");
  if (nameParts.length > 1) {
    return nameParts.at(-1)?.toLowerCase() ?? "bin";
  }

  const mimeSubtype = file.type.split("/").at(-1)?.toLowerCase();
  return mimeSubtype || "bin";
};

export type ParsedListingForm = {
  address: string;
  city: string;
  zipCode: string;
  beds: number | null;
  baths: number | null;
  area: number | null;
  price: number;
  availableFrom: string | null;
  availableTo: string | null;
  utility: boolean;
  parking: boolean;
  furnished: boolean;
  title: string;
  description: string | null;
  applicationType: string;
  contactEmail: string | null;
  contactPhone: string | null;
  applicationPdfFile: File | null;
  imageFiles: File[];
  removeImageIds: string[];
  coverImageId: string | null;
};

export function parseListingForm(
  formData: FormData,
  options?: { requirePdfUpload?: boolean },
): { data: ParsedListingForm | null; message: string | null } {
  const address = getString(formData, "address");
  const city = getString(formData, "city");
  const title = getString(formData, "title");

  if (!address || !city || !title) {
    return { data: null, message: "Please fill in address, city, and title." };
  }

  const priceResult = parseIntField(formData, "price", "monthly rent");
  if ("error" in priceResult) {
    return { data: null, message: priceResult.error ?? "Invalid monthly rent." };
  }
  if (priceResult.value === null) {
    return { data: null, message: "Monthly rent is required." };
  }

  const bedsResult = parseIntField(formData, "beds", "bedrooms");
  if ("error" in bedsResult) {
    return { data: null, message: bedsResult.error ?? "Invalid bedrooms." };
  }

  const bathsResult = parseIntField(formData, "baths", "bathrooms");
  if ("error" in bathsResult) {
    return { data: null, message: bathsResult.error ?? "Invalid bathrooms." };
  }

  const areaResult = parseFloatField(formData, "area", "square footage");
  if ("error" in areaResult) {
    return { data: null, message: areaResult.error ?? "Invalid square footage." };
  }

  const zipCode = getString(formData, "zip_code");
  if (!zipCode) return { data: null, message: "Zip Code is required." };

  const applicationType = getString(formData, "application_type");
  if (!applicationType) {
    return { data: null, message: "Please select an application method." };
  }

  let contactEmail: string | null = null;
  let contactPhone: string | null = null;
  let applicationPdfFile: File | null = null;

  if (applicationType === "contact") {
    contactEmail = getString(formData, "contact_email");
    if (!contactEmail) {
      return { data: null, message: "Email is required for contact method." };
    }
    contactPhone = getString(formData, "contact_phone") || null;
  }

  if (applicationType === "pdf") {
    const file = formData.get("application_pdf");
    if (file instanceof File && file.size > 0) {
      applicationPdfFile = file;
    } else if (options?.requirePdfUpload) {
      return { data: null, message: "PDF file is required." };
    }
  }

  const imageFiles = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const removeImageIds = formData
    .getAll("remove_image_ids")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const coverImageId = getString(formData, "cover_image_id") || null;

  return {
    data: {
      address,
      city,
      zipCode,
      beds: bedsResult.value,
      baths: bathsResult.value,
      area: areaResult.value,
      price: priceResult.value,
      availableFrom: getString(formData, "available_from") || null,
      availableTo: getString(formData, "available_to") || null,
      utility: formData.get("utility") === "true",
      parking: formData.get("parking") === "true",
      furnished: formData.get("furnished") === "true",
      title,
      description: getString(formData, "description") || null,
      applicationType,
      contactEmail,
      contactPhone,
      applicationPdfFile,
      imageFiles,
      removeImageIds,
      coverImageId,
    },
    message: null,
  };
}

export async function geocodeDistanceFromCampus(
  address: string,
  city: string,
  zipCode: string,
) {
  const geoLocObj = await fetch(
    "https://geocode.maps.co/search?q=" +
      address +
      "+" +
      city +
      "+MA+" +
      zipCode +
      "+US&api_key=69e0f89a88c8f361421390rtzd3c1fd",
  );

  if (!geoLocObj.ok) {
    return { distance: null, message: "Geocoding Error" };
  }

  const geoLocJson = await geoLocObj.json();
  const firstResult = geoLocJson?.[0];

  if (!firstResult?.lat || !firstResult?.lon) {
    return { distance: null, message: "Geocoding Error" };
  }

  const geoCoords = { latitude: firstResult.lat, longitude: firstResult.lon };
  const distance = getDistance(UMASS_COORDS, geoCoords) / 1609;
  return { distance, message: null };
}

export async function uploadApplicationPdf(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  const fileName = `${userId}-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage.from("applications").upload(fileName, file, {
    contentType: "application/pdf",
  });

  if (uploadError) {
    return { url: null, message: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage.from("applications").getPublicUrl(fileName);
  return { url: publicUrlData.publicUrl, message: null };
}

export async function uploadListingImages(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  files: File[],
  markFirstAsCover: boolean,
) {
  if (files.length === 0) return { message: null };

  const uploadedImages: Array<{ url: string; storage_path: string; cover: boolean }> = [];

  for (const [index, file] of files.entries()) {
    const extension = getFileExtension(file);
    const fileName = `${userId}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("listing_images")
      .upload(fileName, file, {
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return { message: `Unexpected error: ${uploadError.message}.` };
    }

    const { data: publicUrlData } = supabase.storage
      .from("listing_images")
      .getPublicUrl(fileName);

    uploadedImages.push({
      url: publicUrlData.publicUrl,
      storage_path: fileName,
      cover: markFirstAsCover && index === 0,
    });
  }

  const imageRows = uploadedImages.map((image) => ({
    listing: listingId,
    url: image.url,
    storage_path: image.storage_path,
    cover: image.cover,
  }));

  const { error: imagesError } = await supabase.from("images").insert(imageRows);
  if (imagesError) {
    return { message: `Unexpected error: ${imagesError.message}.` };
  }

  return { message: null };
}

export async function ensureListingCover(
  supabase: SupabaseClient,
  listingId: string,
) {
  const { data: coverRows, error: coverError } = await supabase
    .from("images")
    .select("id")
    .eq("listing", listingId)
    .eq("cover", true)
    .limit(1);

  if (coverError) {
    return { message: `Unexpected error: ${coverError.message}.` };
  }

  if ((coverRows ?? []).length > 0) {
    return { message: null };
  }

  const { data: firstImage, error: firstImageError } = await supabase
    .from("images")
    .select("id")
    .eq("listing", listingId)
    .order("upload_time", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstImageError) {
    return { message: `Unexpected error: ${firstImageError.message}.` };
  }

  if (!firstImage) {
    return { message: null };
  }

  const { error: updateError } = await supabase
    .from("images")
    .update({ cover: true })
    .eq("id", firstImage.id);

  if (updateError) {
    return { message: `Unexpected error: ${updateError.message}.` };
  }

  return { message: null };
}
