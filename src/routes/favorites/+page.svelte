<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  const { data, form } = $props();
</script>

<div class="flex-1 overflow-y-auto">
  <section class="p-8 space-y-8">
    {#if data.message || form?.message}
      <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {form?.message || data.message}
      </p>
    {/if}
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-9">
        {#each data.favorites as listing (listing.id)}
          <Card class="p-0 shadow-md">
            <img
              src={listing.imageSrc}
              alt={listing.address}
              class="w-full h-56 {listing.isPlaceholder
                ? "bg-zinc-200 object-contain p-10"
                : "object-cover"}"
            />

            <div class="space-y-1 p-6">
              <h2 class="text-2xl font-semibold tracking-tight">{listing.address}</h2>
              <p class="text-lg">
                {listing.title}
              </p>
              <p class="text-sm text-zinc-600">
                <span class="font-medium text-zinc-800">
                  {listing.distanceFromCampusMi} mi
                </span>
                from campus
              </p>
              <div class="flex justify-end pt-2">
                <form method="POST" action="?/remove">
                  <input type="hidden" name="id" value={listing.id} />
                  <button type="submit" class="text-sm font-medium text-red-800 hover:text-red-700">
                    Remove
                  </button>
                </form>
              </div>
            </div>

          </Card>
        {/each}
      </div>
    {/if}
  </section>
</div>
