<script lang="ts">
  import Card from "$lib/components/Card.svelte";

  const favorites = [
    { title: "Example Listing 1", address: "123 Example St" },
    { title: "Example Listing 2", address: "456 Sample Ave" },
    { title: "Example Listing 3", address: "789 Demo Blvd" }
  ];
</script>

<div class="flex-1 flex overflow-hidden">
  <section class="p-8 space-y-8 flex flex-col flex-1">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-semibold tracking-tighter">
          Favorite Listings
        </h1>
        <p class="text-zinc-600">
          View and manage properties you have saved.
        </p>
      </div>
    </div>

    <Card class="flex-1 flex flex-col gap-4 overflow-hidden">
      <h2 class="text-2xl font-medium tracking-tight">
        Saved properties
      </h2>

      <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
        {#if favorites.length === 0}
          <p class="text-zinc-500">
            You have no favorite listings yet.
          </p>
        {:else}
          {#each favorites as listing}
            <div class="border border-zinc-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p class="font-medium tracking-tight">{listing.title}</p>
                <p class="text-sm text-zinc-600">{listing.address}</p>
              </div>

              <button class="text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-3 py-2 rounded transition-colors">
                View
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </Card>
  </section>
</div>
