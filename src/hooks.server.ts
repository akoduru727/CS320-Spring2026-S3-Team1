import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";

const isAuthExempt = (path: string) => {
  return path === "/" || path === "/login" || path.startsWith("/auth");
};

const isOnboardingExempt = (path: string) => {
  return isAuthExempt(path) || path.startsWith("/onboarding");
};

const parseAccountType = (value: unknown): "tenant" | "landlord" | null => {
  return value === "tenant" || value === "landlord" ? value : null;
};

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * note: you have to add the `path` variable to the
       * set and remove method due to sveltekit's cookie api
       * requiring this to be set, setting the path to `/`
       * will replicate previous/standard behaviour (https://kit.svelte.dev/docs/types#public-types-cookies)
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: "/" });
        });
      },
    },
  });
  event.locals.supabase = supabase;

  /**
   * unlike `supabase.auth.getSession`, which is unsafe on the server because it
   * doesn't validate the jwt, this function validates the jwt by first calling
   * `getUser` and aborts early if the jwt signature is invalid.
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

  const { session, user } = await safeGetSession();
  event.locals.session = session;
  event.locals.user = user;
  event.locals.accountType = user?.user_metadata.account_type;

  const path = event.url.pathname;

  // ignore non-route requests (e.g. assets)
  if (event.route.id && !session && !isAuthExempt(path)) {
    return redirect(303, `/login?next=${encodeURIComponent(path + event.url.search)}`);
  }

  // onboard if account type has not been selected
  if (event.route.id && user && !isOnboardingExempt(path) && !event.locals.accountType) {
    return redirect(303, "/onboarding");
  }

  return await resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
