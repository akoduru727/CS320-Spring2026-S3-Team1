import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/profile";

  if (!code) {
    return redirect(303, `/login?error=${encodeURIComponent("Missing OAuth code")}`);
  }

  const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(303, `/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect(303, next.startsWith("/") ? next : "/profile");
};
