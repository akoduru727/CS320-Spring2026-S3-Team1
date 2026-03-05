import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const { session } = await locals.safeGetSession();

  if (!session) {
    const next = encodeURIComponent(url.pathname + url.search);
    return redirect(303, `/login?next=${next}`);
  }
};
