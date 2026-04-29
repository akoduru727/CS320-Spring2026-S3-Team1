import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.accountType !== "landlord" || !locals.user) return redirect(307, "/");

  const { data, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("landlord", locals.user.id);

  // TODO: propagate this as a displayed error message
  if (error) {
    console.log("[error] failed to fetch listings for landlord");
    return { listings: [] }
  }

  return { listings: data };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    // TODO: respond with an error code
    if (!locals.user) return;

    const listingId = await request.text();
    const { data, error } = await locals.supabase
      .from("listings")
      .delete()
      .eq("landlord", locals.user.id)
      .eq("id", listingId);
    
    if (error) {
      // TODO: propagate error
    }
  },
};
