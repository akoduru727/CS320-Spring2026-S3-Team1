import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

type PreferenceRecord = {
  tenant: string;
  organization: number | null;
  noise: number | null;
  cleanliness: number | null;
  sleep_schedule: string | null;
  pets: boolean | null;
  smoking: boolean | null;
  overnight_guests: boolean | null;
  cost_preference: string | null;
  name: string;
  email: string;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined";
};

type TenantRecord = {
  id: string;
  name: string;
  email: string;
  roommate_group_id: string | null;
  group_leader: boolean;
};

type GroupInvite = {
  id: string;
  group_id: string;
  tenant_id: string;
  invited_by: string;
  status: "pending" | "declined";
};

export type GroupData = {
  group_id: string;
  leader_id: string;
  members: TenantRecord[];
  pendingInvites: GroupInvite[];
};

const isAdjacentLevelMatch = (currentLevel: number, candidateLevel: number) => Math.abs(currentLevel - candidateLevel) <= 1;

const isExactMatch = <T>(currentValue: T, candidateValue: T) => currentValue === candidateValue;

const isRoommateMatch = (current: PreferenceRecord, candidate: PreferenceRecord) => {
  if (current.tenant === candidate.tenant){
    return false;
  }

  return (
    isAdjacentLevelMatch(current.organization, candidate.organization) &&
    isAdjacentLevelMatch(current.noise, candidate.noise) &&
    isAdjacentLevelMatch(current.cleanliness, candidate.cleanliness) &&
    isExactMatch(current.sleep_schedule, candidate.sleep_schedule) &&
    isExactMatch(current.pets, candidate.pets) &&
    isExactMatch(current.smoking, candidate.smoking) &&
    isExactMatch(current.overnight_guests, candidate.overnight_guests) 
  );
};

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) return redirect(303, "/login");

  if (locals.accountType !== "tenant") {
    return { roommateMatches: [], friendRequests: [] };
  }

  const { data: preferences, error: prefError } = await locals.supabase
    .from("preferences")
    .select("tenant, organization, noise, cleanliness, sleep_schedule, pets, smoking, overnight_guests, cost_preferences");

  if (prefError || !preferences) {
    return { roommateMatches: [], friendRequests: [] };
  }

  const currentTenantPreferences = preferences.find(({ tenant }) => tenant === user.id);

  if (!currentTenantPreferences) {
    return { roommateMatches: [], friendRequests: [], currentTenant: null, group: null, myInvites: [] };
  }

  const roommateMatches = preferences.filter((candidate) =>
    isRoommateMatch(currentTenantPreferences, candidate)
  );

  const matchedIds = roommateMatches.map((m) => m.tenant);

  const { data: tenants, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("id, name, email")
    .in("id", matchedIds);

  if (tenantError) {
    return { roommateMatches: [], friendRequests: [], currentTenant: null, group: null, myInvites: [] };
  }

  const enrichedMatches = roommateMatches.map((match) => {
    const tenant = tenants?.find((t) => t.id === match.tenant);
    return { ...match, name: tenant?.name ?? "Unknown", email: tenant?.email ?? "" };
  });

  const { data: friendRequests, error: frError } = await locals.supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in("sender_id", [...matchedIds, user.id])
    .in("receiver_id", [...matchedIds, user.id]);

  if (frError) {
    return { roommateMatches: enrichedMatches, friendRequests: [] };
  }

  return {
    roommateMatches: enrichedMatches,
    friendRequests: (friendRequests ?? []) as FriendRequest[],
  };
};



export const actions: Actions = {
  send: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const receiverId = formData.get("receiverId") as string;
    if (!receiverId) return fail(400, { message: "Receiver is required." });

    const { error } = await locals.supabase
      .from("friend_requests")
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) return fail(500, { message: `Failed to send request: ${error.message}` });
  },

  cancel: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const receiverId = formData.get("receiverId") as string;
    if (!receiverId) return fail(400, { message: "Receiver is required." });

    const { error } = await locals.supabase
      .from("friend_requests")
      .delete()
      .eq("sender_id", user.id)
      .eq("receiver_id", receiverId);

    if (error) return fail(500, { message: `Failed to cancel request: ${error.message}` });
  },

  accept: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const senderId = formData.get("senderId") as string;
    if (!senderId) return fail(400, { message: "Sender is required." });

    const { error } = await locals.supabase
      .from("friend_requests")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) return fail(500, { message: `Failed to accept request: ${error.message}` });
  },

  decline: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const senderId = formData.get("senderId") as string;
    if (!senderId) return fail(400, { message: "Sender is required." });

    const { error } = await locals.supabase
      .from("friend_requests")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) return fail(500, { message: `Failed to decline request: ${error.message}` });
  },
};