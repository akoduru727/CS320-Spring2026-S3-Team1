<script lang="ts">
  import { enhance } from "$app/forms";

  const { data } = $props();
  const { roommateMatches, friendRequests, currentTenant, group, myInvites } = $derived(data);

  type FriendRequest = {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: "pending" | "accepted" | "declined";
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

/* Placeholder avatar colors, need to figure out avatar configs in general! */

  const avatarColors = [
    
    { bg: "bg-teal-100", text: "text-teal-700" },
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
    { bg: "bg-violet-100", text: "text-violet-700" },
  ];

  const getAvatarColor = (id: string) =>
    avatarColors[id.charCodeAt(0) % avatarColors.length];

  const getFriendStatus = (tenantId: string) => {
    const req = (friendRequests as FriendRequest[]).find(
      (r) => r.sender_id === tenantId || r.receiver_id === tenantId
    );
    if (!req) return "none";
    if (req.status === "accepted") return "accepted";
    if (req.status === "pending" && req.sender_id === currentTenant.id) return "sent";
    if (req.status === "pending" && req.receiver_id === currentTenant.id) return "received";
    return "none";
  };

  const formatPrefs = (match: typeof roommateMatches[0]) =>
    [
      match.sleep_schedule ?? null,
      match.cost_preference ?? null,
      match.pets ? "Pets ok" : "No pets",
      match.smoking ? "Smoking ok" : "No smoking",
      match.overnight_guests ? "Guests ok" : "No overnight guests",
    ].filter(Boolean);

  const incomingRequests = $derived(
    (friendRequests as FriendRequest[]).filter(
      (r) => r.receiver_id === currentTenant.id && r.status === "pending"
    )
  );

  const acceptedFriends = $derived(
    (friendRequests as FriendRequest[]).filter((r) => r.status === "accepted")
  );

  const getMatchByTenantId = (id: string) =>
    roommateMatches.find((m) => m.tenant === id);


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

  type GroupData = {
    group_id: string;
    leader_id: string;
    members: TenantRecord[];
    pendingInvites: GroupInvite[];
  };

  const isLeader = $derived(currentTenant?.group_leader === true);

  const acceptedFriendIds = $derived(
    (friendRequests as FriendRequest[])
      .filter((r) => r.status === "accepted")
      .map((r) => r.sender_id === currentTenant.id ? r.receiver_id : r.sender_id)
  );

  const invitableFriends = $derived(
    acceptedFriendIds.filter((id: string) => {
      if (!group) return true;
      const g = group as GroupData;
      return !g.members.some((m) => m.id === id) && !g.pendingInvites.some((inv) => inv.tenant_id === id);
    })
  );

  let showGroupPanel = $state(false);  
</script>

<div class="flex-1 overflow-hidden flex h-full">

  <!-- Group panel modal -->
  {#if showGroupPanel && group}
    {@const g = group as GroupData}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        <div class="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-medium text-zinc-800">Roommate group</h2>
            <p class="text-xs text-zinc-400 mt-0.5">{g.members.length} member{g.members.length !== 1 ? "s" : ""}</p>
          </div>
          <button onclick={() => (showGroupPanel = false)} class="text-zinc-400 hover:text-zinc-600 text-xl leading-none">×</button>
        </div>

        <div class="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

          <!-- Members -->
          <div>
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Members</p>
            <div class="space-y-2">
              {#each g.members as member (member.id)}
                {@const color = getAvatarColor(member.id)}
                {@const isMe = member.id === currentTenant.id}
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
                    {getInitials(isMe ? "Me" : member.name)}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-zinc-800 truncate">{isMe ? "You" : member.name}</p>
                  </div>
                  {#if member.group_leader}
                    <span class="text-xs text-zinc-400 shrink-0">Leader</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- Pending invites -->
          {#if g.pendingInvites.length > 0}
            <div>
              <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Pending invites</p>
              <div class="space-y-2">
                {#each g.pendingInvites as invite (invite.id)}
                  {@const match = getMatchByTenantId(invite.tenant_id)}
                  {@const color = getAvatarColor(invite.tenant_id)}
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
                      {getInitials(match?.name ?? "?")}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-zinc-800 truncate">{match?.name ?? "Unknown"}</p>
                    </div>
                    {#if isLeader}
                      <form method="POST" action="?/cancelInvite" use:enhance>
                        <input type="hidden" name="tenantId" value={invite.tenant_id} />
                        <button class="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors shrink-0">
                          Cancel
                        </button>
                      </form>
                    {:else}
                      <span class="text-xs text-amber-500 shrink-0">Invited</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Invite friends (leader only) -->
          {#if isLeader && invitableFriends.length > 0}
            <div>
              <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Invite a friend</p>
              <div class="space-y-2">
                {#each invitableFriends as friendId (friendId)}
                  {@const match = getMatchByTenantId(friendId)}
                  {@const color = getAvatarColor(friendId)}
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
                      {getInitials(match?.name ?? "?")}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-zinc-800 truncate">{match?.name ?? "Unknown"}</p>
                    </div>
                    <form method="POST" action="?/inviteToGroup" use:enhance>
                      <input type="hidden" name="tenantId" value={friendId} />
                      <button class="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0">
                        Invite
                      </button>
                    </form>
                  </div>
                {/each}
              </div>
            </div>
          {:else if isLeader && invitableFriends.length === 0}
            <p class="text-xs text-zinc-400">No friends available to invite — add friends first or all have already been invited.</p>
          {/if}

          <!-- Leave / Delete / Transfer -->
          <div class="pt-2 border-t border-zinc-100 space-y-2">
            {#if isLeader}
              <!-- Transfer leadership -->
              {#if g.members.filter((m) => m.id !== currentTenant.id).length > 0}
                <div>
                  <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Transfer leadership</p>
                  <div class="space-y-1">
                    {#each g.members.filter((m) => m.id !== currentTenant.id) as member (member.id)}
                      {@const color = getAvatarColor(member.id)}
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
                          {getInitials(member.name)}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-zinc-800 truncate">{member.name}</p>
                        </div>
                        <form method="POST" action="?/transferLeadership" use:enhance={{ result() { showGroupPanel = false; } }}>
                          <input type="hidden" name="newLeaderId" value={member.id} />
                          <button class="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0">
                            Make leader
                          </button>
                        </form>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
              <!-- Delete -->
              <form method="POST" action="?/deleteGroup" use:enhance={{ result() { showGroupPanel = false; } }}>
                <button class="w-full text-xs py-2 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors">
                  Delete group
                </button>
              </form>
            {:else}
              <form method="POST" action="?/leaveGroup" use:enhance={{ result() { showGroupPanel = false; } }}>
                <button class="w-full text-xs py-2 px-3 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
                  Leave group
                </button>
              </form>
            {/if}
          </div>

        </div>
      </div>
    </div>
  {/if}

  <!-- Left panel: friends list -->
  <aside class="w-1/3 border-r border-zinc-200 bg-white flex flex-col overflow-hidden">
    <div class="px-5 py-6 border-b border-zinc-100">
        <h2 class="text-xl font-medium text-zinc-800">Friends</h2>
    </div>

    <div class="flex-1 overflow-y-auto">

      <!-- Incoming requests -->
      {#if incomingRequests.length > 0}
        <div class="px-5 pt-5 pb-2">
          <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide">Requests</p>
        </div>
        {#each incomingRequests as req (req.id)}
          {@const match = getMatchByTenantId(req.sender_id)}
          {@const color = getAvatarColor(req.sender_id)}
          <div class="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
              {match ? getInitials(match.name) : "?"}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-zinc-800 truncate">{match?.name ?? "Unknown"}</p>
            </div>
            <div class="flex gap-1.5 shrink-0">
              <form method="POST" action="?/accept" use:enhance>
                <input type="hidden" name="senderId" value={req.sender_id} />
                <button class="text-xs px-2.5 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                  Accept
                </button>
              </form>
              <form method="POST" action="?/decline" use:enhance>
                <input type="hidden" name="senderId" value={req.sender_id} />
                <button class="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
                  Decline
                </button>
              </form>
            </div>
          </div>
        {/each}
      {/if}

      <!-- Accepted friends -->
      {#if acceptedFriends.length > 0}
        <div class="px-5 pt-5 pb-2">
          <p class="font-medium text-zinc-400 uppercase tracking-wide">Friends</p>
        </div>
        {#each acceptedFriends as req (req.id)}
          {@const friendId = req.sender_id === currentTenant.id ? req.receiver_id : req.sender_id}
          {@const match = getMatchByTenantId(friendId)}
          {@const color = getAvatarColor(friendId)}
          <div class="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 {color.bg} {color.text}">
              {match ? getInitials(match.name) : "?"}
            </div>
            <div class="min-w-0">
              <p class="text-sm text-zinc-800 truncate">{match?.name ?? "Unknown"}</p>
            </div>
          </div>
        {/each}
      {/if}

      {#if incomingRequests.length === 0 && acceptedFriends.length === 0}
        <p class="text-s text-zinc-400 px-5 py-6">No friends yet, send a friend request to a roommate match!</p>
      {/if}

      <!-- Group section -->
      <div class="px-5 pt-6 pb-2 border-t border-zinc-100 mt-4 flex items-center justify-between">
        <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide">Roommate Group</p>
      </div>

      <!-- Pending group invites received -->
      {#each (myInvites as GroupInvite[]) as invite (invite.id)}
        {@const inviterMatch = getMatchByTenantId(invite.invited_by)}
        <div class="mx-4 mb-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
          <p class="text-xs font-medium text-amber-800 mb-0.5">Group invite</p>
          <p class="text-xs text-amber-600 mb-2">From {inviterMatch?.name ?? "Unknown"}</p>
          <div class="flex gap-1.5">
            <form method="POST" action="?/acceptGroupInvite" use:enhance class="flex-1">
              <input type="hidden" name="groupId" value={invite.group_id} />
              <button class="w-full text-xs px-2.5 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                Join
              </button>
            </form>
            <form method="POST" action="?/declineGroupInvite" use:enhance class="flex-1">
              <input type="hidden" name="groupId" value={invite.group_id} />
              <button class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                Decline
              </button>
            </form>
          </div>
        </div>
      {/each}

      <!-- Existing group or create button -->
      {#if group}
        <button
          onclick={() => (showGroupPanel = true)}
          class="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors"
        >
          <div class="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-zinc-800">My group</p>
            <p class="text-xs text-zinc-400 mt-0.5">
              {(group as GroupData).members.length} member{(group as GroupData).members.length !== 1 ? "s" : ""}
              {#if (group as GroupData).pendingInvites.length > 0}
                · {(group as GroupData).pendingInvites.length} pending
              {/if}
            </p>
          </div>
        </button>
      {:else if (myInvites as GroupInvite[]).length === 0}
        <div class="px-5 py-3">
          <form method="POST" action="?/createGroup" use:enhance>
            <button class="w-full text-xs py-2 px-3 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:bg-zinc-50 transition-colors">
              + Create a group
            </button>
          </form>
        </div>
      {/if}

    </div>
  </aside>

  <!-- Right panel: roommate matches -->
  <main class="flex-1 overflow-y-auto px-6 py-8">
    <div class="mb-8">
      <h1 class="text-xl font-medium text-zinc-800">Connect</h1>
      <p class="text-zinc-500 mt-1">People with similar living preferences as yours</p>
    </div>

    {#if roommateMatches.length === 0}
      <div class="text-s text-zinc-400 py-12 text-center">
        No matches yet, make sure your preferences are filled out in your profile!
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {#each roommateMatches as match (match.tenant)}
          {@const status = getFriendStatus(match.tenant)}
          {@const color = getAvatarColor(match.tenant)}

          <div class="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4">
            <!-- Avatar + name/email -->
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium shrink-0 {color.bg} {color.text}">
                {getInitials(match.name)}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-zinc-800 truncate">{match.name}</p>
                <p class="text-xs text-zinc-400 truncate">{match.email}</p>
              </div>
            </div>

            <!-- Shared prefs -->
            <div class="flex flex-wrap gap-1.5">
              {#each formatPrefs(match) as pref}
                <span class="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                  {pref}
                </span>
              {/each}
            </div>

            <hr class="border-zinc-100" />

            <!-- Actions -->
            <div class="flex gap-2">
              {#if status === "accepted"}
                <span class="flex-1 text-center text-xs py-2 px-3 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                  Friends
                </span>
              {:else if status === "sent"}
                <form method="POST" action="?/cancel" use:enhance class="flex-1">
                  <input type="hidden" name="receiverId" value={match.tenant} />
                  <button class="w-full text-xs py-2 px-3 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
                    Pending — cancel
                  </button>
                </form>
              {:else if status === "received"}
                <form method="POST" action="?/accept" use:enhance class="flex-1">
                  <input type="hidden" name="senderId" value={match.tenant} />
                  <button class="w-full text-xs py-2 px-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                    Accept request
                  </button>
                </form>
                <form method="POST" action="?/decline" use:enhance>
                  <input type="hidden" name="senderId" value={match.tenant} />
                  <button class="text-xs py-2 px-3 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
                    Decline
                  </button>
                </form>
              {:else}
                <form method="POST" action="?/send" use:enhance class="flex-1">
                  <input type="hidden" name="receiverId" value={match.tenant} />
                  <button class="w-full text-xs py-2 px-3 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Add friend
                  </button>
                </form>
              {/if}

              <button class="flex-1 text-xs py-2 px-3 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                Message
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

</div>