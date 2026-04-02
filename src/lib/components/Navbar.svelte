<script lang="ts">
    // In Svelte 5, props are accessed like this
    interface Props {
      accountType: "tenant" | "landlord" | null,
      isAuthenticated: boolean,
    };

  const { accountType, isAuthenticated }: Props = $props();

  // Step 1: define routes based on account type
  let routes = $state([]);

  if (accountType === "tenant") {
    routes = [
      { name: "Profile", href: "/profile" },
      { name: "Connect", href: "/" },
      { name: "Chats", href: "/" },
      { name: "Favorites", href: "/" },
      { name: "History", href: "/" },
      { name: "About", href: "/" },
      { name: "Application Portal", href: "/" },
    ];
  } else if (accountType === "landlord") {
    routes = [
      { name: "Your Listings", href: "/dashboard" },
      { name: "Application Portal", href: "/" },
      { name: "Chats", href: "/" },
      { name: "About", href: "/" },
    ];
  }
</script>

<nav class="flex items-center justify-between bg-zinc-100 p-4 shadow">
  <a href="/">
    <span class="select-none text-3xl font-bold tracking-tighter text-red-500">amhrest</span>
  </a>

  {#each routes as { name, href }, i (name)}
    <a href={href}>
      {name}
    </a>
  {/each}

  {#if isAuthenticated}
    <form method="POST" action="/auth/signout">
     <button
        type="submit"
        class="rounded-md bg-zinc-900 hover:bg-zinc-800 transition-colors px-3 py-1.5 text-sm font-medium text-zinc-100"
      >
        Sign Out
      </button>
    </form>
  {:else}
    <a
      class="rounded-md bg-zinc-900 hover:bg-zinc-800 transition-colors px-3 py-1.5 text-sm font-medium text-zinc-100"
      href="/login"
    >
      Sign in
    </a>
  {/if}
</nav>