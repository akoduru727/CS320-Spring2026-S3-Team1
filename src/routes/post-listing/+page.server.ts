import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import getDistance from 'geolib/es/getDistance';

const UMASS_COORDS = { latitude: "42.3851442", longitude:  "-72.5252865" };

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

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    if (locals.accountType !== "landlord") {
      return fail(403, { message: "Only landlords can create listings." });
    }

    const formData = await request.formData();

    const address = getString(formData, "address");
    const city = getString(formData, "city");
    const title = getString(formData, "title");

    if (!address || !city || !title) {
      return fail(400, { message: "Please fill in address, city, and title." });
    }


    const priceResult = parseIntField(formData, "price", "monthly rent");
    if ("error" in priceResult) return fail(400, { message: priceResult.error });
    if (priceResult.value === null) {
      return fail(400, { message: "Monthly rent is required." });
    }

    const bedsResult = parseIntField(formData, "beds", "bedrooms");
    if ("error" in bedsResult) return fail(400, { message: bedsResult.error });

    const bathsResult = parseIntField(formData, "baths", "bathrooms");
    if ("error" in bathsResult) return fail(400, { message: bathsResult.error });

    const areaResult = parseFloatField(formData, "area", "square footage");
    if ("error" in areaResult) return fail(400, { message: areaResult.error });

    const zipCode = getString(formData, "zip_code") || null;
    if(!zipCode) return fail(400, { message: "Zip Code is required." })

    const geoLocObj = await fetch(
            "https://geocode.maps.co/search?q=" +
            address +
            "+" +
            city +
            "+MA+" +
            zipCode +
            "+US&api_key=69e0f89a88c8f361421390rtzd3c1fd");
    if (!geoLocObj.ok) return fail(500, {message: "Geocoding Error"});
    const geoLocJson = (await geoLocObj.json())[0];
    const geoCoords = { latitude: geoLocJson.lat, longitude: geoLocJson.lon };

    const distanceFromCampus = getDistance(UMASS_COORDS, geoCoords);
    console.log(distanceFromCampus);

    const availableFrom = getString(formData, "available_from") || null;
    const availableTo = getString(formData, "available_to") || null;
    const description = getString(formData, "description") || null;
    const applicationType = getString(formData, "application_type");
    if (!applicationType) {
      return fail(400, { message: "Please select an application method." });
    }
    let contactEmail: string | null = null;
    let contactPhone: string | null = null;
    let pdfUrl: string | null = null;

    const utility = formData.get("utility") === "true";
    const parking = formData.get("parking") === "true";
    const furnished = formData.get("furnished") === "true";

    if (applicationType === "contact") {
      contactEmail = getString(formData, "contact_email");
      if (!contactEmail) {
        return fail(400, { message: "Email is required for contact method." });
      }
      contactPhone = getString(formData, "contact_phone") || null;
    }

    if (applicationType === "pdf") {
      const file = formData.get("application_pdf");
      if (!(file instanceof File) || file.size === 0) {
        return fail(400, { message: "PDF file is required." });
      }
      const fileName = `${user.id}-${Date.now()}.pdf`;
      const { error: uploadError } = await locals.supabase.storage.from("applications").upload(fileName, file, {
        contentType: "application/pdf",
      });

      if (uploadError) {
        console.log("UPLOAD ERROR:", uploadError);
        return fail(500, { message: uploadError.message });
      }

      const { data: publicUrlData } = locals.supabase.storage.from("applications").getPublicUrl(fileName);
      pdfUrl = publicUrlData.publicUrl;
    }

    const payload = {
      landlord: user.id,
      address,
      city,
      zip_code: zipCode,
      beds: bedsResult.value,
      baths: bathsResult.value,
      area: areaResult.value,
      price: priceResult.value,
      available_from: availableFrom,
      available_to: availableTo,
      utility,
      parking,
      furnished,
      title,
      description,
      status: "Vacant",

      application_type: applicationType,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      application_pdf_url: pdfUrl,
    };

    const { error } = await locals.supabase.from("listings").insert(payload);

    if (error) {
      return fail(500, { message: `Unexpected error: ${error.message}.` });
    }

    return redirect(303, "/dashboard");
  },
};
