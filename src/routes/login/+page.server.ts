import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const { session } = await locals.safeGetSession();

  if (session) {
    return redirect(303, "/profile");
  }

  return {
    authError: url.searchParams.get("error"),
  };
};

export const actions: Actions = {
  google: async ({ locals, url }) => {
    const next = url.searchParams.get("next") || "/profile";

    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return fail(500, {
        message: "Unable to start Google sign-in. Please try again.",
      });
    }

    return redirect(303, data.url);
  },
};
