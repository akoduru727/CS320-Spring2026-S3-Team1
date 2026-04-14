<script lang="ts">
	import Card from "$lib/components/Card.svelte";
  import { SquarePen, X } from "@lucide/svelte";

	interface Props {
		name: string;
		address: string;
	};

	const { name, address }: Props = $props();
</script>

<Card class="flex justify-between">
  <div class="flex items-center gap-6">
    <div class="h-20 w-20 bg-zinc-300"></div>

    <div>
      <p class="text-lg font-medium">
        {name}
      </p>
      <p>
        {address}
      </p>
    </div>
  </div>

  <div class="flex items-center gap-6">
    <button aria-label="Edit listing" class="hover:text-zinc-700 transition-colors">
      <SquarePen />
    </button>

    <button aria-label="Delete listing" class="hover:text-zinc-700 transition-colors">
      <X size={30} />
    </button>
  </div>
</Card>
