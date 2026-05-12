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

  const pathname = $derived(page.url.pathname);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  let routes: Route[] = $derived.by(() => {
    if (accountType === "tenant") {
      return [
        { name: "Search", href: "/search", icon: Search },
        { name: "Profile", href: "/profile", icon: User },
        { name: "Connect", href: "/roommate-connect", icon: Users },
        { name: "Chats", href: "/renter-chatroom", icon: MessageCircle },
        { name: "Favorites", href: "/favorites", icon: Star },
        { name: "Application Portal", href: "/application-portal", icon: FileText },
      ];
    }

    if (accountType === "landlord") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Profile", href: "/profile", icon: User },
        { name: "Create Listing", href: "/create-listing", icon: PlusSquare },
        { name: "Application Portal", href: "/application-portal", icon: FileText },
        { name: "Chats", href: "/landlord-chatroom", icon: MessageCircle },
      ];
    }

    return [];
  });
</script>

<nav class="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-100/90 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center gap-5 px-6 py-3">
    <a href={isAuthenticated ? (accountType === "landlord" ? "/dashboard" : "/search") : "/login"}>
      <span class="select-none text-3xl font-bold tracking-tighter text-red-800">amhrest</span>
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
  </div>
</nav>