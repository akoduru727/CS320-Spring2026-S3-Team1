import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");

  const { data, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("id", params.slug)
    .single();

  if (error) return redirect(303, "/");

  return { listing: error ? null : data };
}
