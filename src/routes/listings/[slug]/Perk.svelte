<script lang="ts">
  import { Check, X } from "@lucide/svelte";

  interface Props {
    value: boolean;
    yes: string;
    no: string;
  };

  const { value, yes, no }: Props = $props();
</script>

<div class="flex gap-2">
  <div class={`p-1 rounded-md ${value ? "bg-green-500/20 text-green-800" : "bg-red-500/20 text-red-800"}`}>
    {#if value}
      <Check size={16} />
    {:else}
      <X size={16} />
    {/if}
  </div>
  <span>
    {value ? yes : no}
  </span>
</div>
