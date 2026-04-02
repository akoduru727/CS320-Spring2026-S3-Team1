<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  const { data } = $props();
</script>

<div class="flex-1">
  <section class="p-8 space-y-8">
    <div>
      <div>
        <h1 class="text-3xl font-semibold tracking-tighter">
          Favorite Listings
        </h1>
        <p class="text-zinc-600">
          View and manage properties you have saved.
        </p>
      </div>
    </div>

    {#if data.favorites.length === 0}
      <p class="text-zinc-500">
        You have no favorite listings yet.
      </p>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {#each data.favorites as listing}
          <Card class="p-3 space-y-3">
            <img
              src={listing.imageSrc}
              alt={listing.address}
              class="w-full h-56 rounded-md {listing.isPlaceholder
                ? 'bg-zinc-200 object-contain p-10'
                : 'object-cover'}"
            />

            <div class="space-y-1">
              <h2 class="text-2xl font-semibold tracking-tight">{listing.address}</h2>
              <p class="text-sm text-zinc-600">
                Distance from campus
                <span class="font-medium text-zinc-800">
                  {listing.distanceFromCampusMi} mi
                </span>
              </p>
              <p class="text-l text-zinc-1000">
                {listing.description}
              </p>
            </div>

          </Card>
        {/each}
      </div>
    {/if}
  </section>
</div>
