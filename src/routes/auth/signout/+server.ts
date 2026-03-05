import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  return redirect(303, "/login");
};
