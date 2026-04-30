<script lang="ts">
  import { pluralize } from "$lib/pluralize";
  import Card from "$lib/components/Card.svelte";
  import Slider from "./Slider.svelte";
  import { ChevronUp, Star } from "@lucide/svelte";

  const { data, form } = $props();

  let searchTerm = $state("");
  let bathValue = $state(0);
  let bedValue = $state(0);
  let miValue = $state(0);
  let showFilters = $state(false);

  const toggleShowFilters = () => { showFilters = !showFilters };

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
      if(miValue == 0 || (listing.distance_from_campus_mi ?? 0) <= miValue) {
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
    <!-- search bar and filters -->
    <Card class="p-4">
      <div class="flex items-center gap-6">
        <input type="text" placeholder="Search for a listing..."
          class="w-full px-3 py-2 bg-zinc-200 rounded-xl"
          bind:value={searchTerm}
        />
        <button class="tracking-tighter font-medium px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 transition-colors text-zinc-100">
          Search
        </button>
        <button 
          onclick={toggleShowFilters}
          title="Show filters"
        >
          <ChevronUp 
            class="transition-transform {showFilters ? "scale-y-100" : "-scale-y-100"}"
          />
        </button>
      </div>

      <div class="grid transition-all ease-in-out {showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}">
        <div class="flex gap-9 mt-3 overflow-hidden">
          <Slider 
            min=0 max=10 
            bind:value={bathValue} 
            showAny={_ => "Any number of baths"}
            showValue={n => pluralize("bath", n)}
          />
          <Slider 
            min=0 max=10 
            bind:value={bedValue} 
            showAny={_ => "Any number of beds"}
            showValue={n => pluralize("bed", n)}
          />
          <Slider 
            min=0 max=10 
            bind:value={miValue} 
            showAny={_ => "Any distance from campus"}
            showValue={n => `Within ${pluralize("mile", n)} of campus`}
          />
        </div>
      </div>
    </Card>

    <!-- error message -->
    {#if form?.message}
      <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {form.message}
      </p>
    {/if}

    <div class="flex-1 flex gap-5 min-h-0 justify-between">
      <div class="w-full overflow-y-auto">
        <div class='grid grid-cols-3 gap-6 justify-between'>
          {#if filteredSearch.length == 0}
            <div class="space-y-1">
              <h2 class="text-2xl font-semibold tracking-tight">No listings</h2>
              <p class="text-sm text-zinc-600">Try adjusting your search parameters</p>
            </div>
          {:else}
            {#each filteredSearch as listing (listing.id)}
               <a href={`/listings/${listing.id}`}>
                <Card class="p-4 space-y-3">
                  <img
                    src={listing.img ?? "/listing-placeholder.png"}
                    alt={listing.address}
                    class={listing.img
                      ? "w-full h-40 rounded-md object-cover"
                      : "w-full h-40 rounded-md bg-zinc-200 object-contain p-6"}
                  />

                  <div class="space-y-1">
                    <div class="flex items-start justify-between gap-3">
                      <h2 class="text-2xl font-semibold tracking-tight">{listing.title}</h2>
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

                    <p class="text-lg">
                      {listing.address}
                    </p>
                    <p class="text-sm text-zinc-600">
                      <span class="font-medium text-zinc-800">
                        <!-- round to one decimal point -->
                        {Math.round((listing.distance_from_campus_mi ?? 0) * 10) / 10} mi
                      </span>
                      from campus
                    </p>
                  </div>
                </Card>
               </a>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </section>
</div>
