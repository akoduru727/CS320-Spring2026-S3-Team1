<script lang="ts">
	import type { Snippet } from "svelte";

  interface Props {
    name: string,
    description: string,
    children?: Snippet,
  };

  const { name, description, children }: Props = $props();
</script>

<div class="flex justify-between items-center">
  <div>
    <h3 class="text-sm">
      {name}  
    </h3>
    <p class="text-sm text-zinc-500">
      {description}
    </p>
  </div>

  {@render children?.()}
</div>
