import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public";
import { env } from "$env/dynamic/private";
import { createServerClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
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
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: "/" });
        });
      },
    },
  });
  event.locals.supabase = supabase;

  if (env.auth === "true") {
    const accountType: "tenant" | "landlord" = env.acc_type === "landlord" ? "landlord" : "tenant";
    const session: Session = {
      access_token: "e2e-access-token",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "e2e-refresh-token",
      user: {
        id: "e2e-user",
        aud: "authenticated",
        role: "authenticated",
        email: "e2e@example.com",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { account_type: accountType }
      }
    };

    const user = session.user;
    event.locals.safeGetSession = async () => ({ session, user });
    event.locals.session = session;
    event.locals.user = user;
    event.locals.accountType = user.user_metadata.account_type;

    return await resolve(event, {
      filterSerializedResponseHeaders(name: string) {
        return name === "content-range" || name === "x-supabase-api-version";
      }
    });
  }

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
  const metadataType = user?.user_metadata?.account_type;
  event.locals.accountType = metadataType === "tenant" || metadataType === "landlord" ? metadataType : null;

  /**
   * my code only delete this if wrong
   */
  const e2eUserCookie = event.cookies.get("e2e-user");

  if (e2eUserCookie) {
    try {
      const e2eUser = JSON.parse(e2eUserCookie) as {
        id?: unknown;
        email?: unknown;
        account_type?: unknown;
      };
      const accountType = e2eUser.account_type;

      if (
        typeof e2eUser.id !== "string" ||
        typeof e2eUser.email !== "string" ||
        (accountType !== "tenant" && accountType !== "landlord")
      ) {
        throw new Error("auth cookie");
      }

      event.locals.user = 
      {
        id: e2eUser.id,
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: e2eUser.email,
        user_metadata: {
          account_type: accountType,
        },
      } as typeof event.locals.user;
      event.locals.accountType = accountType;
      event.locals.session = {
        user: event.locals.user,
      } as typeof event.locals.session;

      return await resolve(event, {
        filterSerializedResponseHeaders(name: string) {
          return name === "content-range" || name === "x-supabase-api-version";
        },

      });

    } catch {
    }
  }


  const path = event.url.pathname;


  if (event.route.id && !session && !isAuthExempt(path)) {
    return redirect(303, `/login?next=${encodeURIComponent(path + event.url.search)}`);
  }

  if (event.route.id && user && !isOnboardingExempt(path) && !event.locals.accountType) {
    return redirect(303, "/onboarding");
  }

  return await resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
