import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

const isMissingPreferencesTable = (message: string | undefined) => {
  const lower = (message ?? "").toLowerCase();
  return lower.includes("could not find the table") && lower.includes("preferences");
};

const isMissingTenantNameColumn = (message: string | undefined) => {
  const lower = (message ?? "").toLowerCase();
  return lower.includes("column") && lower.includes("name") && lower.includes("does not exist");
};

const getProfileTable = (accountType: "tenant" | "landlord" | null) => {
  if (accountType === "tenant") return "tenants";
  if (accountType === "landlord") return "landlords";
  return null;
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

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) return redirect(303, "/login");
  const profileTable = getProfileTable(locals.accountType);
  if (!profileTable) return redirect(303, "/");
  const isTenant = locals.accountType === "tenant";

  const savedParam = url.searchParams.get("saved");
  const saved = savedParam === "name" || (isTenant && savedParam === "preferences") ? savedParam : null;

  const { data: profileRow, error: profileError } = await locals.supabase
    .from(profileTable)
    .select("name")
    .eq("id", locals.user.id)
    .maybeSingle();
  if (profileError) console.error(profileError);
  const profileNameMessage = profileError
    ? (isMissingTenantNameColumn(profileError.message)
      ? "Profile name column is not set up yet. Run `scripts/supabase-profile-name.sql` in Supabase SQL editor."
      : profileError.message)
    : null;
  const metadataName = typeof locals.user.user_metadata?.name === "string" ? locals.user.user_metadata.name.trim() : "";
  const profileName = (profileRow?.name ?? "").trim() || metadataName;

  if (!isTenant) {
    return {
      mode: "landlord" as const,
      preferences: null,
      message: null,
      profileName,
      profileNameMessage,
      saved,
    };
  }

  const { data, error } = await locals.supabase
    .from("preferences")
    .select("organization, noise, cleanliness, sleep_schedule, pets, smoking, overnight_guests")
    .eq("tenant", locals.user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    const message = isMissingPreferencesTable(error.message)
      ? "Preferences table is not set up yet."
      : error.message;
    return {
      mode: "tenant" as const,
      preferences: null,
      message,
      profileName,
      profileNameMessage,
      saved,
    };
  }

  return {
    mode: "tenant" as const,
    preferences: data ?? null,
    message: null,
    profileName,
    profileNameMessage,
    saved,
  };
};

export const actions: Actions = {
  updateName: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");
    const profileTable = getProfileTable(locals.accountType);
    if (!profileTable) return fail(403, { nameFormMessage: "Only tenants and landlords can update their name." });

    const formData = await request.formData();
    const name = getString(formData, "name");

    if (!name) return fail(400, { nameFormMessage: "Name is required." });
    if (name.length > 80) return fail(400, { nameFormMessage: "Name is too long (max 80 characters)." });

    const { error } = await locals.supabase
      .from(profileTable)
      .update({ name })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      if (isMissingTenantNameColumn(error.message)) {
        return fail(500, {
          nameFormMessage: "Profile name column is not set up yet. Run `scripts/supabase-profile-name.sql` in Supabase SQL editor.",
        });
      }
      return fail(500, { nameFormMessage: error.message });
    }

    try {
      await locals.supabase.auth.updateUser({ data: { name } });
    } catch (authError) {
      console.error(authError);
    }

    return redirect(303, "/profile?saved=name");
  },
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

    const overnightResult = formData.get("overnight") === "true"

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

    return redirect(303, "/profile?saved=preferences");
  }
}
