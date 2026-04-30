<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Slider from "./Slider.svelte";
  import { Star } from "@lucide/svelte";

  const { data, form } = $props();

  let searchTerm = $state("");
  let bathValue = $state(0);
  let bedValue = $state(0);
  let miValue = $state(0);

  const favoriteSet = $derived(new Set(data.favoriteIds ?? []));
  const appliedSet = $derived(new Set(data.appliedIds ?? []));

  let filteredSearch = $derived(
    (data.listings ?? []).filter((listing) => {
      const query = searchTerm.toLowerCase();
      const title = (listing.title ?? "").toLowerCase();
      const address = (listing.address ?? "").toLowerCase();

      const bathBool = bathValue === 0 || listing.baths === bathValue;
      const bedBool = bedValue === 0 || listing.beds === bedValue;
      const miBool =
        miValue === 0 || listing.distance_from_campus_mi === miValue;

      return (
        (title.includes(query) || address.includes(query)) &&
        bathBool &&
        bedBool &&
        miBool
      );
    })
  );
</script>

<div class="flex flex-1 overflow-hidden">
  <section class="flex flex-1 flex-col space-y-8 p-8">

<div class="flex-1 flex overflow-hidden">
  <section class="p-8 space-y-8 flex flex-col flex-1">

      <div class="flex gap-5 min-h-0 justify-center">
        <div>
          <div class="flex ">
            <div class=" flex flex-col items-center justify-center gap-5">
            <h1 class="text-5xl font-semibold tracking-tighter">
              Search Listings
            </h1>
            <p class="text-zinc-600">
              Browse available rentals and open a listing to apply.
            </p>
          </div>
        </div>


      <div class="mt-6 w-full max-w-xl">
        <input
          type="text"
          placeholder="Search for a listing..."
          class="w-full rounded-lg border border-zinc-400 px-3 py-3 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          bind:value={searchTerm}
        />
      </div>
    </div>

    <!-- FORM MESSAGE -->
    {#if form?.message}
      <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {form.message}
      </p>
    {/if}

    <!-- MAIN CONTENT -->
    <div class="flex flex-1 gap-5 min-h-0">

      <!-- LISTINGS -->
      <Card class="w-2/3 overflow-y-auto">
        <div class="grid grid-cols-2 gap-5">

          {#if filteredSearch.length === 0}
            <div>
              <h2 class="text-2xl font-semibold">No Listings</h2>
              <p class="text-sm text-zinc-600">
                Try adjusting your search parameters
              </p>
            </div>

          {:else}
            {#each filteredSearch as listing (listing.id)}
              <Card class="p-3 space-y-3">

                <img
                  src={listing.img ?? "/listing-placeholder.png"}
                  alt={listing.address}
                  class={listing.img
                    ? "w-full h-40 rounded-md object-cover"
                    : "w-full h-40 rounded-md bg-zinc-200 object-contain p-6"}
                />

                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-3">

                    <h2 class="text-xl font-semibold">
                      {listing.address}
                    </h2>

                    <h2 class="text-2xl font-semibold tracking-tight">{listing.title}</h2>
                    <form method="POST" action="?/toggleFavorite">
                      <input type="hidden" name="id" value={listing.id} />
                      <button
                        type="submit"
                        class="flex items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-zinc-200"
                      >
                        <Star
                          size={16}
                          class={favoriteSet.has(listing.id)
                            ? "text-yellow-500 fill-yellow-500"
                            : ""}
                        />
                        <span>
                          {favoriteSet.has(listing.id)
                            ? "Unfavorite"
                            : "Favorite"}
                        </span>
                      </button>
                    </form>

                  </div>

                  <p class="text-sm text-zinc-600">
                    Distance:
                  <p class="text-lg">
                    {listing.address}
                  </p>
                  <p class="text-sm text-zinc-600">
                    <span class="font-medium text-zinc-800">
                      <!-- round to one decimal point -->
                      {Math.round((listing.distance_from_campus_mi ?? 0) * 10) / 10} mi
                    </span>
                  </p>

                  <p>{listing.title}</p>

                  <!-- APPLY SECTION -->
                  {#if !appliedSet.has(listing.id)}
                    <a
                      href={`/listings/${listing.id}`}
                      class="mt-2 inline-block bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Apply
                    </a>
                  {:else}
                    <a
                      href={`/listings/${listing.id}`}
                      class="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Applied ✓
                    </a>  
                  {/if}
                    from campus
                  </p>
                </div>
              </Card>
            {/each}
          {/if}

        </div>
      </Card>

      <!-- FILTER SIDEBAR -->
      <Card class="flex w-1/3 flex-col gap-3">

        <h2 class="text-2xl font-medium">Filter</h2>

        <div class="flex flex-col gap-3 overflow-y-auto">
          <Card>
            <Slider min="0" max="10" bind:value={bathValue} unit="Bath" />
          </Card>

          <Card>
            <Slider min="0" max="10" bind:value={bedValue} unit="Bed" />
          </Card>

          <Card>
            <Slider min="0" max="10" bind:value={miValue} unit="Mile" />
          </Card>
        </div>

      </Card>

    </div>
  </section>
</div>