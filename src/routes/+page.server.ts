import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();

  return redirect(307, session ? "/profile" : "/login");
};
