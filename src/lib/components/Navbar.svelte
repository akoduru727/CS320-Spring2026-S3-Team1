<script lang="ts">
  interface Props {
    accountType: "tenant" | "landlord" | null,
    isAuthenticated: boolean,
  };

  const { accountType, isAuthenticated }: Props = $props();

  type Route = {
    name: string;
    href: string;
  };

  let routes: Route[] = $derived(
    accountType === "tenant" ? [
      { name: "Profile", href: "/profile" },
      { name: "Connect", href: "/" },
      { name: "Chats", href: "/renter-chatroom" },
      { name: "Favorites", href: "/favorites" },
      { name: "History", href: "/" },
      { name: "About", href: "/" },
      { name: "Application Portal", href: "/renter-landing" },
    ] : accountType === "landlord" ? [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Post Listing", href: "/post-listing" },
      { name: "Application Portal", href: "/" },
      { name: "Chats", href: "/landlord-chatroom" },
      { name: "About", href: "/" },
    ] : []
  );
</script>

<nav class="flex items-center justify-between bg-zinc-100 p-4 shadow">
  <a href="/">
    <span class="select-none text-3xl font-bold tracking-tighter text-red-800">amhrest</span>
  </a>

  <div class="flex items-center gap-9">
    {#each routes as { name, href } (name)}
      <a 
        {href}
        class="rounded-md px-3 py-1.5 hover:bg-zinc-200 transition-colors"
      >
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
  </div>
</nav>
