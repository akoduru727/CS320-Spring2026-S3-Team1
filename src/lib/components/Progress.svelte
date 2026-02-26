<script lang="ts">
  interface Props {
    level: number,
    max: number,
  };

  const { level, max }: Props = $props();
</script>

<div class="flex gap-2">
  {#each {length: max} as _, i}
    <div 
      class="flex-1 h-2 rounded-full"
      class:bg-zinc-300={i >= level}
      class:bg-red-500={i < level}
    >
    </div>
  {/each}
</div>
