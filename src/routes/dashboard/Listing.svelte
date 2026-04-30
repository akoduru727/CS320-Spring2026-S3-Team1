<script lang="ts">
	import Card from "$lib/components/Card.svelte";
  import { SquarePen, X } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";

	interface Props {
    id: string;
		name: string;
		address: string;
    imageSrc: string;
    isPlaceholder: boolean;
	};

	const { id, name, address, imageSrc, isPlaceholder }: Props = $props();

  const deleteListing = async () => {
    const ok = confirm(`Are you sure you'd like to delete ${name}?`);
    if (!ok) return;

    // TODO: handle possible errors
    await fetch("?/delete", {
      method: "POST",
      body: id,
    });

    await invalidateAll();
  };
</script>

<Card class="flex justify-between">
  <div class="flex items-center gap-6">
    <img
      src={imageSrc}
      alt={address}
      class="h-20 w-20 rounded-md {isPlaceholder
        ? 'bg-zinc-200 object-contain p-3'
        : 'object-cover'}"
    />

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
    <button
      aria-label="Edit listing" 
      class="hover:text-zinc-700 transition-colors"
    >
      <SquarePen />
    </button>

    <button 
      onclick={deleteListing}
      aria-label="Delete listing" 
      class="hover:text-zinc-700 transition-colors"
    >
      <X size={30} />
    </button>
  </div>
</Card>
