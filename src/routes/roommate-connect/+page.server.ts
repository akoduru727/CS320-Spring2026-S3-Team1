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
    isExactMatch(current.cost_preference, candidate.cost_preference) &&
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
    .select("tenant, organization, noise, cleanliness, sleep_schedule, pets, smoking, overnight_guests, cost_preference");

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

  const { data: currentTenant, error: ctError } = await locals.supabase
    .from("tenants")
    .select("id, name, email, roommate_group_id, group_leader")
    .eq("id", user.id)
    .single();

  if (ctError || !currentTenant) {
    return { roommateMatches: [], friendRequests: [], currentTenant: null, group: null, myInvites: [] };
  }



  let group: GroupData | null = null;

  if (currentTenant.roommate_group_id) {
    const gid = currentTenant.roommate_group_id;

    const { data: groupMembers } = await locals.supabase
      .from("tenants")
      .select("id, name, email, roommate_group_id, group_leader")
      .eq("roommate_group_id", gid);

    const { data: pendingInvites } = await locals.supabase
      .from("group_invites")
      .select("id, group_id, tenant_id, invited_by, status")
      .eq("group_id", gid)
      .eq("status", "pending");

    const leader = (groupMembers ?? []).find((m) => m.group_leader);

    group = {
      group_id: gid,
      leader_id: leader?.id ?? currentTenant.id,
      members: (groupMembers ?? []) as TenantRecord[],
      pendingInvites: (pendingInvites ?? []) as GroupInvite[],
    };
  }

  console.log("group:", JSON.stringify(group));
  console.log("currentTenant:", JSON.stringify(currentTenant));

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
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  if (frError) {
    return { roommateMatches: enrichedMatches, friendRequests: [], currentTenant, group, myInvites: [] };
  }

  const { data: myInvites } = await locals.supabase
    .from("group_invites")
    .select("id, group_id, tenant_id, invited_by, status")
    .eq("tenant_id", user.id)
    .eq("status", "pending");

  return {
    roommateMatches: enrichedMatches,
    friendRequests: (friendRequests ?? []) as FriendRequest[],
    currentTenant,
    group,
    myInvites: (myInvites ?? []) as GroupInvite[],
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

    // Syncs to tenants.friends array for the chatroom
    const { data: myRow } = await locals.supabase
      .from("tenants").select("friends").eq("id", user.id).single();
    const { data: theirRow } = await locals.supabase
      .from("tenants").select("friends").eq("id", senderId).single();

    await locals.supabase.from("tenants").update({
      friends: [...new Set([...(myRow?.friends ?? []), senderId])]
    }).eq("id", user.id);

    await locals.supabase.from("tenants").update({
      friends: [...new Set([...(theirRow?.friends ?? []), user.id])]
    }).eq("id", senderId);
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

  createGroup: async ({ locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id")
      .eq("id", user.id)
      .single();

    if (me?.roommate_group_id) {
      return fail(400, { message: "You are already in a group. You must leave your current group if you want to join another group." });
    }

    const newGroupId = crypto.randomUUID();

    const { error } = await locals.supabase
      .from("tenants")
      .update({ roommate_group_id: newGroupId, group_leader: true })
      .eq("id", user.id);

    if (error) return fail(500, { message: `Failed to create group: ${error.message}` });
  },

  inviteToGroup: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const tenantId = formData.get("tenantId") as string;
    if (!tenantId) return fail(400, { message: "Missing tenant ID." });

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id, group_leader")
      .eq("id", user.id)
      .single();

    if (!me?.roommate_group_id || !me.group_leader) {
      return fail(403, { message: "Only the group leader can invite members." });
    }

    const { data: invitee } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id")
      .eq("id", tenantId)
      .single();

    if (invitee?.roommate_group_id) {
      return fail(400, { message: "This person is already in a group." });
    }

    const { error } = await locals.supabase
      .from("group_invites")
      .insert({ group_id: me.roommate_group_id, tenant_id: tenantId, invited_by: user.id, status: "pending" });

    if (error) return fail(500, { message: `Failed to send invite: ${error.message}` });
  },

  cancelInvite: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const tenantId = formData.get("tenantId") as string;
    if (!tenantId) return fail(400, { message: "Missing tenant ID." });

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id, group_leader")
      .eq("id", user.id)
      .single();

    if (!me?.roommate_group_id || !me.group_leader) {
      return fail(403, { message: "Only the group leader can cancel invites." });
    }

    const { error } = await locals.supabase
      .from("group_invites")
      .delete()
      .eq("group_id", me.roommate_group_id)
      .eq("tenant_id", tenantId);

    if (error) return fail(500, { message: `Failed to cancel invite: ${error.message}` });
  },

  acceptGroupInvite: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const groupId = formData.get("groupId") as string;
    if (!groupId) return fail(400, { message: "Missing group ID." });

    const { error: inviteError } = await locals.supabase
      .from("group_invites")
      .delete()
      .eq("group_id", groupId)
      .eq("tenant_id", user.id)
      .eq("status", "pending");

    if (inviteError) return fail(500, { message: `Failed to accept invite: ${inviteError.message}` });

    const { error: tenantError } = await locals.supabase
      .from("tenants")
      .update({ roommate_group_id: groupId, group_leader: false })
      .eq("id", user.id);

    if (tenantError) return fail(500, { message: `Failed to join group: ${tenantError.message}` });
  },

  declineGroupInvite: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const groupId = formData.get("groupId") as string;
    if (!groupId) return fail(400, { message: "Missing group ID." });

    const { error } = await locals.supabase
      .from("group_invites")
      .update({ status: "declined" })
      .eq("group_id", groupId)
      .eq("tenant_id", user.id)
      .eq("status", "pending");

    if (error) return fail(500, { message: `Failed to decline invite: ${error.message}` });
  },

  leaveGroup: async ({ locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id, group_leader")
      .eq("id", user.id)
      .single();

    if (!me?.roommate_group_id) return fail(400, { message: "You are not in a group." });
    if (me.group_leader) return fail(400, { message: "You must delete the group before leaving, or transfer leadership first." });

    const { error } = await locals.supabase
      .from("tenants")
      .update({ roommate_group_id: null, group_leader: false })
      .eq("id", user.id);

    if (error) return fail(500, { message: `Failed to leave group: ${error.message}` });
  },

  deleteGroup: async ({ locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id, group_leader")
      .eq("id", user.id)
      .single();

    if (!me?.roommate_group_id || !me.group_leader) {
      return fail(403, { message: "Only the group leader can delete the group." });
    }

    const gid = me.roommate_group_id;

    const { error: membersError } = await locals.supabase
      .from("tenants")
      .update({ roommate_group_id: null, group_leader: false })
      .eq("roommate_group_id", gid);

    if (membersError) return fail(500, { message: `Failed to delete group: ${membersError.message}` });

    await locals.supabase.from("group_invites").delete().eq("group_id", gid);
  },

  transferLeadership: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return redirect(303, "/login");

    const formData = await request.formData();
    const newLeaderId = formData.get("newLeaderId") as string;
    if (!newLeaderId) return fail(400, { message: "Missing new leader ID." });

    const { data: me } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id, group_leader")
      .eq("id", user.id)
      .single();

    if (!me?.roommate_group_id || !me.group_leader) {
      return fail(403, { message: "Only the group leader can transfer leadership." });
    }

    // Verify the new leader is actually in the same group
    const { data: newLeader } = await locals.supabase
      .from("tenants")
      .select("roommate_group_id")
      .eq("id", newLeaderId)
      .single();

    if (newLeader?.roommate_group_id !== me.roommate_group_id) {
      return fail(400, { message: "The new leader must be a member of your group." });
    }

    // Remove leadership from current user
    const { error: demoteError } = await locals.supabase
      .from("tenants")
      .update({ group_leader: false })
      .eq("id", user.id);

    if (demoteError) return fail(500, { message: `Failed to transfer leadership: ${demoteError.message}` });

    // Assign leadership to new user
    const { error: promoteError } = await locals.supabase
      .from("tenants")
      .update({ group_leader: true })
      .eq("id", newLeaderId);

    if (promoteError) return fail(500, { message: `Failed to transfer leadership: ${promoteError.message}` });
  }
};