import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";

const isAuthExempt = (path: string) => {
  return path === "/" || path === "/login" || path.startsWith("/auth");
};

const isOnboardingExempt = (path: string) => {
  return path === "/" || path.startsWith("/auth") || path.startsWith("/onboarding");
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

  /**
   * my code only delete this if wrong
   */
  const e2eUserCookie = event.cookies.get("e2e-user");

  if (e2eUserCookie) {
    try {
      const e2eUser = JSON.parse(e2eUserCookie);

      event.locals.user = {
        id: e2eUser.id,
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: e2eUser.email,
        user_metadata: {
          account_type: e2eUser.account_type,
        },
      } as typeof event.locals.user;
      event.locals.accountType = e2eUser.account_type;
      event.locals.session = {
        user: event.locals.user,
      } as typeof event.locals.session;

      return await resolve(event, {
        filterSerializedResponseHeaders(name: string) {
          return name === "content-range" || name === "x-supabase-api-version";
        },
      });
    } catch {
      // Ignore malformed e2e auth cookies and fall back to normal auth.
    }
  }


  const path = event.url.pathname;

  // send to /login if user is not authenticated
  if (event.route.id && !session && !isAuthExempt(path)) {
    return redirect(303, `/login?next=${encodeURIComponent(path + event.url.search)}`);
  }

  // send to /onboarding if account type has not been selected
  if (event.route.id && user && !isOnboardingExempt(path) && !event.locals.accountType) {
    return redirect(303, "/onboarding");
  }

  return await resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
