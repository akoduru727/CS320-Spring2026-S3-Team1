import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  onboard: async ({ request, locals }) => {
    const supabase = locals.supabase;
    const { user } = await locals.safeGetSession();
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const accountType = formData.get("account-type");

    // invalid account type
    if (accountType !== "tenant" && accountType !== "landlord") {
      return fail(400, {
        message: "Please choose either Tenant or Landlord.",
      });
    }

    const table = `${accountType}s`;
    const { error } = await supabase
      .from(table)
      .insert({ 
        id: user.id, 
        name: user.user_metadata.name, 
        email: user.email, 
        phone: user.phone 
      });

    // database error when inserting
    if (error) {
      return fail(500, {
        message: `Unexpected error: ${error.message}.`,
      });
    }

    return redirect(303, "/profile");
  },
};
