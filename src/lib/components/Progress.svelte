<script lang="ts">

  interface Props {
    level: number,
    max: number,
    onChange : (value : number) => void
  };

  function setLevel(newLevel : number){
      level = newLevel
      onChange?.(newLevel)
    }

  let { level, max, onChange }: Props = $props();
</script>

<div class="flex gap-2">
  {#each {length: max} as _, i}
    <div 
      class="flex-1 h-2 rounded-full cursor-pointer transition ease-in-out duration-200"
      class:bg-zinc-300={i >= level}
      class:bg-red-800={i < level}
      onclick={() => setLevel(i + 1)}
    >
    </div>
  {/each}
</div>
