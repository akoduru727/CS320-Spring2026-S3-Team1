<script lang="ts">
  import "./layout.css";
  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";
  import Navbar from '$lib/components/Navbar.svelte';

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

<main class="relative h-screen flex flex-col bg-zinc-200">
  <Navbar/>
  {@render children()}
</main>
