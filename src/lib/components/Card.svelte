<script lang="ts">
  import type { Snippet } from "svelte";
  import { twMerge } from "tailwind-merge";

  interface Props {
    children: Snippet;
    class?: string;
  };
  
  const baseClass = "bg-zinc-100 p-6 rounded-xl border border-zinc-300";
  const { children, class: extraClass = "" }: Props = $props();
</script>


<div class={twMerge(baseClass, extraClass)}>
  {@render children()}
</div>
