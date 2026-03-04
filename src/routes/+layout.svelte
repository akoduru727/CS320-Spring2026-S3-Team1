<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon}/>
</svelte:head>

<main class="relative min-h-svh bg-zinc-200 flex flex-col">
  <nav class="bg-zinc-100 p-4 flex shadow">
    <a href="/">
      <span class="tracking-tighter text-3xl font-bold text-red-500 select-none">
        amhoust
      </span> 
    </a>
  </nav>
  {@render children()}
</main>
