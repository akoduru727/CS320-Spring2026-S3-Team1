<script lang="ts">
    import Card from "$lib/components/Card.svelte";

    interface Props {
      name: string;
      stat: number;
      unit: string;
    };

    const { name, stat, unit }: Props = $props();
</script>

<Card class="space-y-3">
  <p class="font-medium text-zinc-600">
    {name}
  </p>
  <p class="text-lg font-medium">
    {stat} {unit}{stat != 1 ? "s" : ""}
  </p>
</Card> 
