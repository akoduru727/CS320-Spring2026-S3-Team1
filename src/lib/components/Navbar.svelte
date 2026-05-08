<script lang="ts">
  import { page } from "$app/state";
  import { totalUnreadCount } from "$lib/components/unreadStore";
  import {
    FileText,
    Home,
    MessageCircle,
    PlusSquare,
    Search,
    Star,
    User,
    Users,
  } from "@lucide/svelte";

  interface Props {
    accountType: "tenant" | "landlord" | null,
    isAuthenticated: boolean,
    totalUnread?: number;
  };

  const { accountType, isAuthenticated, totalUnread = 0 }: Props = $props();

  type Route = {
    name: string;
    href: string;
    icon: any;
  };

  let routes: Route[] = $derived(
    accountType === "tenant" ? [
      { name: "Profile", href: "/profile" },
      { name: "Connect", href: "/roommate-connect" },
      { name: "Chats", href: "/" },
      { name: "Favorites", href: "/favorites" },
      { name: "History", href: "/" },
      { name: "About", href: "/" },
      { name: "Application Portal", href: "/" },
    ] : accountType === "landlord" ? [
      { name: "Your Listings", href: "/dashboard" },
      { name: "Application Portal", href: "/" },
      { name: "Chats", href: "/" },
      { name: "About", href: "/" },
    ] : []
  );

    const isActive = (href: string) => page.url.pathname === href;
</script>

<nav class="flex items-center justify-between bg-zinc-100 p-4 shadow">
  <a href="/">
    <span class="select-none text-3xl font-bold tracking-tighter text-red-500">amhrest</span>
  </a>

    <div class="flex flex-1 items-center justify-center gap-1">
      {#each routes as { name, href, icon } (name)}
        {@const Icon = icon}
        <a
          {href}
          aria-current={isActive(href) ? "page" : undefined}
          class={[
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            isActive(href)
              ? "bg-zinc-200 text-zinc-900"
              : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900",
          ].join(" ")}
        >
          <Icon size={16} />
          <span>{name}</span>
          {#if name === "Chats" && $totalUnreadCount > 0}
          <span class="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {$totalUnreadCount}
          </span>
          {/if}
        </a>
      {/each}
    </div>

    {#if isAuthenticated}
      <form method="POST" action="/auth/signout">
        <button
          type="submit"
          class="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
        >
          Sign Out
        </button>
      </form>
    {:else}
      <a
        class="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
        href="/login"
      >
        Sign In
      </a>
    {/if}

</nav>
