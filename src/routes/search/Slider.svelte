<script lang="ts">
  interface Props {
    min: string;
    max: string;
    value: number;
    showValue: (value: number) => string;
    showAny: (value: number) => string;
  };

  let { min, max, value = $bindable(), showValue, showAny }: Props = $props();

  const unitStr: string = $derived(value === 0 
    ? showAny(value)
    : showValue(value));
</script>

<div class="flex-1">
  <input
    class="w-full accent-red-500" 
    type="range" 
    {min} 
    {max} bind:value 
  />
  <h2>{unitStr}</h2>
</div>
