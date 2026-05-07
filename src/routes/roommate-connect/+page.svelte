<script lang="ts">
  import { enhance } from "$app/forms";

  const { data } = $props();
  const { roommateMatches, friendRequests, user } = $derived(data);

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
    if (req.status === "pending" && req.sender_id === user.id) return "sent";
    if (req.status === "pending" && req.receiver_id === user.id) return "received";
    return "none";
  };

  const formatPrefs = (match: typeof roommateMatches[0]) =>
    [
      match.sleep_schedule ?? null,
      match.pets ? "Pets ok" : "No pets",
      match.smoking ? "Smoking ok" : "No smoking",
      match.overnight_guests ? "Guests ok" : "No overnight guests",
    ].filter(Boolean);

  const incomingRequests = $derived(
    (friendRequests as FriendRequest[]).filter(
      (r) => r.receiver_id === user.id && r.status === "pending"
    )
  );

  const acceptedFriends = $derived(
    (friendRequests as FriendRequest[]).filter((r) => r.status === "accepted")
  );

  const getMatchByTenantId = (id: string) =>
    roommateMatches.find((m) => m.tenant === id);
</script>

<div class="flex-1 overflow-hidden flex h-full">

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
          {@const friendId = req.sender_id === user.id ? req.receiver_id : req.sender_id}
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