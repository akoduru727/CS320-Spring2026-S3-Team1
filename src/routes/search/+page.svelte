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

  let filteredSearch = $derived(
    (data.listings ?? []).filter((listing) => {
      const query = searchTerm.toLowerCase();
      const title = (listing.title ?? "").toLowerCase();
      const address = (listing.address ?? "").toLowerCase();
      let bathBool = false;
      let bedBool = false;
      let miBool = false;
      if(bathValue == 0 || listing.baths == bathValue) {
        bathBool = true;
      } else bathBool = false;
      if(bedValue == 0 || listing.beds == bedValue) {
        bedBool = true;
      } else bedBool = false;
      if(miValue == 0 || listing.distance_from_campus_mi == miValue) {
        miBool = true;
      } else miBool = false;
      return (
        (title.includes(query) || address.includes(query)) && 
        (bathBool && bedBool && miBool)
      );
    })
  );
</script>


<div class="flex-1 flex overflow-hidden">
  <section class="p-8 space-y-8 flex flex-col flex-1">

      <div class="flex gap-5 min-h-0 justify-center">
        <div>
          <div class="flex ">
            <div class=" flex flex-col items-center justify-center gap-5">
            <h1 class="text-5xl font-semibold tracking-tighter">
              Welcome to your renting dashboard
            </h1>
            <p class="text-zinc-600">
              Search, view, and apply for the listing right for you.
            </p>
          </div>
        </div>


      <!--Search Bar-->
        <div class="mt-10 flex ">
          <input type="text" placeholder="Search for a listing..."
            class="w-full px-3 py-3 border border-zinc-400 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ease-in-out"
            bind:value={searchTerm}>
        </div>
      </div>
    </div>



    <!--Browse beneath search-->
    {#if form?.message}
      <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {form.message}
      </p>
    {/if}

  <div class="flex-1 flex gap-5 min-h-0 justify-between">
    <Card class="w-2/3 overflow-y-auto">
      <div class='grid grid-cols-2 gap-5 justify-between'>
        {#if filteredSearch.length == 0}
            <div>
                <h2 class="text-2xl font-semibold tracking-tight">No Listings</h2>
                <p class="text-sm text-zinc-600">Try adjusting your search parameters</p>
            </div>
        {:else}
            {#each filteredSearch as listing (listing.id)}
             <a href={`/listings/${listing.id}`}>
              <Card class="p-3 space-y-3">
                <img
                  src={listing.img ?? "/listing-placeholder.png"}
                  alt={listing.address}
                  class={listing.img
                    ? "w-full h-40 rounded-md object-cover"
                    : "w-full h-40 rounded-md bg-zinc-200 object-contain p-6"}
                />

                <div class="space-y-1">
                  <div class="flex items-start justify-between gap-3">
                    <h2 class="text-2xl font-semibold tracking-tight">{listing.address}</h2>
                    <form method="POST" action="?/toggleFavorite">
                      <input type="hidden" name="id" value={listing.id} />
                      <button
                        type="submit"
                        class="flex items-center gap-2 rounded-md border border-zinc-300 px-2 py-1 text-sm font-medium hover:bg-zinc-200 transition-colors"
                        aria-label={favoriteSet.has(listing.id) ? "Remove from favorites" : "Add to favorites"}
                        title={favoriteSet.has(listing.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          size={16}
                          class={favoriteSet.has(listing.id) ? "text-yellow-500 fill-yellow-500" : ""}
                        />
                        <span>{favoriteSet.has(listing.id) ? "Unfavorite" : "Favorite"}</span>
                      </button>
                    </form>
                  </div>
                  <p class="text-sm text-zinc-600">
                    Distance from campus
                    <span class="font-medium text-zinc-800">
                      {listing.distance_from_campus_mi} mi
                    </span>
                  </p>
                  <p class="text-l text-zinc-1000">
                    {listing.title}
                  </p>
                </div>
              </Card>
             </a>
            {/each}
        {/if}
      </div>
    </Card>

        <!--Favorites and Recents-->
    <Card class="w-1/3 flex flex-col gap-3 pr-0">
      <div class="flex justify-between pr-6">
        <h2 class="text-2xl font-medium tracking-tight">
          Filter
        </h2>
      </div>

      <div class="flex w-full flex-col items-stretch gap-3 pr-6 overflow-y-auto">
        <Card class="flex">
          <Slider min=0 max=10 bind:value={bathValue} unit="Bath"/>
        </Card>
        <Card class="flex">
          <Slider min=0 max=10 bind:value={bedValue} unit="Bed"/>
        </Card>
        <Card class="flex">
          <Slider min=0 max=10 bind:value={miValue} unit="Mile"/>
        </Card>
      </div>
    </Card>
  </div>
</section>
</div>
