import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    session: locals.session,
    user: locals.user,
    accountType: locals.accountType,
    cookies: cookies.getAll(),
  };
};
