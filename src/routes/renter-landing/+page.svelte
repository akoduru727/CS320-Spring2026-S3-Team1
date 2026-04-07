<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Listing from "./Listing.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let searchTerm = $state("");
  let filteredSearch = $derived(
    data.listings.filter((listing) => {
      const query = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query)
      );
    })
  );
</script>


<div class="flex-1 flex overflow-hidden">
  <section class="p-8 space-y-8 flex flex-col flex-1">
    <div class="flex justify-center items-center">
      <div class=" flex flex-col items-center justify-center gap-5 mt-15">
        <h1 class="text-6xl font-semibold tracking-tighter">
          Welcome to your renting dashboard
        </h1>
        <p class="text-zinc-600">
          Search, view, and apply for the listing right for you.
        </p>
      </div>
    </div>

    <!--Search Bar-->
    <div class="mt-15 flex justify-center">
        <input type="text" placeholder="Search for a listing..."
        class="w-657/1000 px-3 py-3 border border-zinc-400 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ease-in-out"
            bind:value={searchTerm}>
    </div>

    <!--Browse beneath search-->
    <div class="flex-1 flex gap-5 min-h-0 justify-between">
    <Card class="w-2/3 overflow-y-auto">
        <div class='grid grid-cols-2 gap-5 justify-between'>
            {#each filteredSearch as listing (listing.address)}
              <Card class="p-3 space-y-3">
                <img
                  src={listing.img}
                  alt={listing.address}
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
                    {listing.title}
                  </p>
                </div>
              </Card>
            {/each}
        </div>
    </Card>

    <!--Favorites and Recents-->
    <Card class="w-1/3 flex flex-col gap-3 pr-0">
        <div class="flex justify-between pr-6">
          <h2 class="text-2xl font-medium tracking-tight">
            Popular Listings
          </h2>
        </div>

        <div class="flex w-full flex-col items-stretch gap-3 pr-6 overflow-y-auto">
            {#each [0, 1, 2, 3, 4] as n (n)}
                <Listing name="Kendrick Place" address="123 Kendrick Place" />
            {/each}
        </div>
    </Card>
    </div>
  </section>
</div>




