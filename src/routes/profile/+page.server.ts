import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

type PreferenceRecord = {
  tenant: string;
  organization: number;
  noise: number;
  cleanliness: number;
  sleep_schedule: string | null;
  pets: boolean;
  smoking: boolean;
  overnight_guests: boolean;
};

const isAdjacentLevelMatch = (currentLevel: number, candidateLevel: number) => {
  return Math.abs(currentLevel - candidateLevel) === 1;
};

const isExactMatch = <T>(currentValue: T, candidateValue: T) => {
  return currentValue === candidateValue;
};

const isRoommateMatch = (currentTenant: PreferenceRecord, candidateTenant: PreferenceRecord) => {
  if (currentTenant.tenant === candidateTenant.tenant) {
    return false;
  }

  const organizationMatches = isAdjacentLevelMatch(currentTenant.organization, candidateTenant.organization);
  const noiseMatches = isAdjacentLevelMatch(currentTenant.noise, candidateTenant.noise);
  const cleanlinessMatches = isAdjacentLevelMatch(currentTenant.cleanliness, candidateTenant.cleanliness);

  const sleepMatches = isExactMatch(currentTenant.sleep_schedule, candidateTenant.sleep_schedule);
  const petsMatch = isExactMatch(currentTenant.pets, candidateTenant.pets);
  const smokingMatches = isExactMatch(currentTenant.smoking, candidateTenant.smoking);
  const overnightMatches = isExactMatch(currentTenant.overnight_guests, candidateTenant.overnight_guests);

  return (
    organizationMatches &&
    noiseMatches &&
    cleanlinessMatches &&
    sleepMatches &&
    petsMatch &&
    smokingMatches &&
    overnightMatches
  );
};

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) return redirect(303, "/login");

  if (locals.accountType !== "tenant") {
    return {
      roommateMatches: [],
    };
  }

  const { data, error } = await locals.supabase
    .from("preferences")
    .select("tenant, organization, noise, cleanliness, sleep_schedule, pets, smoking, overnight_guests");

  if (error) {
    console.log(error);
    return {
      roommateMatches: [],
    };
  }

  const preferences = (data ?? []) as PreferenceRecord[];
  const currentTenantPreferences = preferences.find(({ tenant }) => tenant === user.id);

  if (!currentTenantPreferences) {
    return {
      roommateMatches: [],
    };
  }

  const roommateMatches = preferences.filter((candidateTenant) =>
    isRoommateMatch(currentTenantPreferences, candidateTenant)
  );

  return {
    roommateMatches,
  };
};

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
