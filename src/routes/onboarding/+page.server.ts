import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.accountType) {
    return redirect(307, locals.accountType == "tenant" ? "/profile" : "/dashboard");
  } 
};

export const actions: Actions = {
  onboard: async ({ request, locals }) => {
    const supabase = locals.supabase;
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const accountType = formData.get("account-type");

    // invalid account type
    if (accountType !== "tenant" && accountType !== "landlord") {
      return fail(400, {
        message: "Please choose either Tenant or Landlord.",
      });
    }

    // TODO: prevent people from submitting the form twice (prevented at ui-level, but not backend-level atm)

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

    // add account type to metadata
    await supabase.auth.updateUser({
      data: { account_type: accountType },
    });
    locals.accountType = accountType;

    return redirect(303, "/");
  },
};
