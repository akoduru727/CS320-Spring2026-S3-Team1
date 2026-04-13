import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

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

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    if (locals.accountType !== "tenant") {
      return fail(403, { message: "Only tenants can update preferences." });
    }

    const formData = await request.formData();

    const organizationResult = parseIntField(formData, "organization", "organization level");
        if ("error" in organizationResult) return fail(400, { message: organizationResult.error });
        if (organizationResult.value === null) {
          return fail(400, { message: "Organization level is required." });
        }

    const noiseResult = parseIntField(formData, "noise", "noise level");
        if ("error" in noiseResult) return fail(400, { message: noiseResult.error });
        if (noiseResult.value === null) {
          return fail(400, { message: "Noise level is required." });
        }

    const cleanlinessResult = parseIntField(formData, "cleanliness", "cleanliness level");
        if ("error" in cleanlinessResult) return fail(400, { message: cleanlinessResult.error });
        if (cleanlinessResult.value === null) {
          return fail(400, { message: "Cleanliness level is required." });
        }
    
    const sleepScheduleResult = getString(formData, "sleep")

    const petsResult = formData.get("pets") === "true";

    const smokingResult = formData.get("smoking") === "true";

    const overnightResult = formData.get("overnight") === "true";

    const payload = {
      tenant : user.id,
      organization : organizationResult.value,
      noise : noiseResult.value,
      cleanliness : cleanlinessResult.value,
      sleep_schedule : sleepScheduleResult,
      pets : petsResult,
      smoking : smokingResult,
      overnight_guests : overnightResult
    }
    
    const { error } = await locals.supabase.from("preferences").upsert(payload, {onConflict : 'tenant'})

    if (error) {
      console.log(error)
      return fail(500, { message: `Unexpected error: ${error.message}.` });
    }
  }
}