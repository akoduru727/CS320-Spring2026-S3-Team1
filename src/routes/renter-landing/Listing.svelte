<script lang="ts">
	import Card from "$lib/components/Card.svelte";

	interface Props {
		name: string;
		address: string;
	};

	const { name, address }: Props = $props();
</script>

<Card class="flex items-center gap-6">
	<div class="h-20 w-20 bg-zinc-300" />

	<div>
		<p class="text-lg font-medium">
      {name}
    </p>
		<p>
      {address}
    </p>
	</div>
</Card>
