import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

type ApplicationStatus = "pending" | "approved" | "rejected";

type TenantApplication = {
  id: string;
  listingId: string;
  listingLabel: string;
  status: ApplicationStatus | string;
  message: string | null;
  createdAt: string | null;
};

type LandlordApplication = TenantApplication & {
  tenantId: string;
  tenantLabel: string;
};

const isMissingApplicationsTable = (message: string | undefined) => {
  const lower = (message ?? "").toLowerCase();
  return lower.includes("could not find the table") && lower.includes("applications");
};

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
};

const listingLabel = (row: { address: string | null; title: string | null }) => {
  const address = row.address?.trim() || "Unknown address";
  const title = row.title?.trim();
  return title ? `${address} — ${title}` : address;
};


export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) return redirect(303, "/login");
  if (locals.accountType !== "tenant" && locals.accountType !== "landlord") {
    return redirect(303, "/onboarding");
  }

  if (locals.accountType === "tenant") {
    const { data: applicationRows, error: applicationError } = await locals.supabase
      .from("applications")
      .select("id, listing, status, message, created_at")
      .eq("tenant", locals.user.id)
      .order("created_at", { ascending: false });

    const dbReady = !isMissingApplicationsTable(applicationError?.message);
    const message = !dbReady
      ? "Applications table is not set up yet. Run `scripts/supabase-applications.sql` in Supabase SQL editor."
      : applicationError?.message || null;
    const rows = (applicationRows ?? []) as Array<{
      id: string;
      listing: string;
      status: string;
      message: string | null;
      created_at: string | null;
    }>;

    const listingIds = Array.from(new Set(rows.map((row) => row.listing).filter(Boolean)));
    const listingById = new Map<string, { address: string | null; title: string | null }>();

    if (listingIds.length > 0) {
      const { data: listingInfoRows, error: listingInfoError } = await locals.supabase
        .from("listings")
        .select("id, address, title")
        .in("id", listingIds);

      if (listingInfoError) console.error(listingInfoError);
      for (const row of (listingInfoRows ?? []) as Array<{ id: string; address: string | null; title: string | null }>) {
        listingById.set(row.id, { address: row.address, title: row.title });
      }
    }

    const applications: TenantApplication[] = dbReady ? rows.map((row) => ({
      id: row.id,
      listingId: row.listing,
      listingLabel: listingLabel(listingById.get(row.listing) ?? { address: null, title: null }),
      status: row.status,
      message: row.message,
      createdAt: row.created_at,
    })) : [];

    return { mode: "tenant" as const, applications, message, dbReady };
  }

  const { data: applicationRows, error: applicationError } = await locals.supabase
    .from("applications")
    .select("id, listing, tenant, status, message, created_at")
    .eq("landlord", locals.user.id)
    .order("created_at", { ascending: false });

  const dbReady = !isMissingApplicationsTable(applicationError?.message);
  const message = !dbReady
    ? "Applications table is not set up yet. Run `scripts/supabase-applications.sql` in Supabase SQL editor."
    : applicationError?.message || null;
  const rows = (applicationRows ?? []) as Array<{
    id: string;
    listing: string;
    tenant: string;
    status: string;
    message: string | null;
    created_at: string | null;
  }>;

  const listingIds = Array.from(new Set(rows.map((row) => row.listing).filter(Boolean)));
  const tenantIds = Array.from(new Set(rows.map((row) => row.tenant).filter(Boolean)));

  const listingById = new Map<string, { address: string | null; title: string | null }>();
  const tenantById = new Map<string, { name: string | null; email: string | null }>();

  if (listingIds.length > 0) {
    const { data: listingInfoRows, error: listingInfoError } = await locals.supabase
      .from("listings")
      .select("id, address, title")
      .in("id", listingIds);
    if (listingInfoError) console.error(listingInfoError);
    for (const row of (listingInfoRows ?? []) as Array<{ id: string; address: string | null; title: string | null }>) {
      listingById.set(row.id, { address: row.address, title: row.title });
    }
  }

  if (tenantIds.length > 0) {
    const { data: tenantRows, error: tenantError } = await locals.supabase
      .from("tenants")
      .select("id, name, email")
      .in("id", tenantIds);
    if (tenantError) console.error(tenantError);
    for (const row of (tenantRows ?? []) as Array<{ id: string; name: string | null; email: string | null }>) {
      tenantById.set(row.id, { name: row.name, email: row.email });
    }
  }

  const applications: LandlordApplication[] = dbReady ? rows.map((row) => {
    const tenant = tenantById.get(row.tenant) ?? { name: null, email: null };
    const tenantLabel = tenant.name?.trim() || tenant.email?.trim() || "Unknown tenant";

    return {
      id: row.id,
      listingId: row.listing,
      listingLabel: listingLabel(listingById.get(row.listing) ?? { address: null, title: null }),
      tenantId: row.tenant,
      tenantLabel,
      status: row.status,
      message: row.message,
      createdAt: row.created_at,
    };
  }) : [];

  return { mode: "landlord" as const, applications, message, dbReady };
};

export const actions: Actions = {
  setStatus: async ({ locals, request }) => {
    if (!locals.user) return redirect(303, "/login");
    if (locals.accountType !== "landlord") return fail(403, { message: "Only landlords can update application status." });

    const formData = await request.formData();
    const applicationId = getString(formData, "application_id");
    const status = getString(formData, "status") as ApplicationStatus | "";

    if (!applicationId) return fail(400, { message: "Missing application id." });
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return fail(400, { message: "Invalid application status." });
    }

    const { data: appRow, error: appError } = await locals.supabase
      .from("applications")
      .select("id, landlord, status")
      .eq("id", applicationId)
      .single();

    if (appError || !appRow) {
      console.error(appError);
      if (isMissingApplicationsTable(appError?.message)) {
        return fail(500, {
          message: "Applications table is not set up yet. Run `scripts/supabase-applications.sql` in Supabase SQL editor.",
        });
      }
      return fail(404, { message: "Application not found." });
    }

    if ((appRow.landlord as string | null) !== locals.user.id) {
      return fail(403, { message: "You do not have access to this application." });
    }

    const currentStatus = ((appRow.status as string | null) ?? "").toLowerCase();
    if (currentStatus && currentStatus !== "pending") {
      return fail(400, { message: "Only pending applications can be updated." });
    }

    const { error: updateError } = await locals.supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (updateError) {
      console.error(updateError);
      if (isMissingApplicationsTable(updateError.message)) {
        return fail(500, {
          message: "Applications table is not set up yet. Run `scripts/supabase-applications.sql` in Supabase SQL editor.",
        });
      }
      return fail(500, { message: updateError.message });
    }

    return redirect(303, "/application-portal");
  },
};
