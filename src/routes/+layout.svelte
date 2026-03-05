<script lang="ts">
  import "./layout.css";
  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";

  import favicon from "$lib/assets/favicon.svg";

  const { data, children } = $props();
  const { supabase, session } = $derived(data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<main class="relative flex min-h-svh flex-col bg-zinc-200">
  <nav class="flex items-center justify-between bg-zinc-100 p-4 shadow">
    <a href="/">
      <span class="select-none text-3xl font-bold tracking-tighter text-red-500">amhrest</span>
    </a>

    {#if session}
      <form method="POST" action="/auth/signout">
        <button
          type="submit"
          class="rounded-md bg-zinc-900 hover:bg-zinc-800 transition-colors px-3 py-1.5 text-sm font-medium text-zinc-100"
        >
          Sign out
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
  {@render children()}
</main>
