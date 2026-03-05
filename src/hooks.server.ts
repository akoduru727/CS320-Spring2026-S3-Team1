import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * Note: You have to add the `path` variable to the
       * set and remove method due to sveltekit"s cookie API
       * requiring this to be set, setting the path to `/`
       * will replicate previous/standard behaviour (https://kit.svelte.dev/docs/types#public-types-cookies)
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: "/" })
        });
      },
    },
  });
  event.locals.supabase = supabase;
  /**
   * Unlike `supabase.auth.getSession`, which is unsafe on the server because it
   * doesn't validate the JWT, this function validates the JWT by first calling
   * `getUser` and aborts early if the JWT signature is invalid.
   */
  const safeGetSession = async () => {
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      return { session: null, user: null };
    }

    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    return { session, user };
  };
  event.locals.safeGetSession = safeGetSession;

  // check if user is onboarded
  const { session, user } = await event.locals.safeGetSession();
  const exempt = ["/onboarding", "/auth"].some(route => event.route.id?.startsWith(route));
  if (session && user && !exempt) {
    const fetch = (table: string) => supabase.from(table).select().eq("id", user.id).maybeSingle();
    const tenant = await fetch("tenants");
    const landlord = await fetch("landlords");
    if (!tenant.data && !landlord.data) {
      return redirect(303, "/onboarding");
    }
  }

  return await resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
}
