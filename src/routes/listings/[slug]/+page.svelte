<script lang="ts">
  import Perk from "./Perk.svelte";
  import { Check, X, Share, Star } from "@lucide/svelte";

  const { data, form } = $props();    
  const listing = $derived(data.listing);
  const isFavorite = $derived(data.isFavorite);

  const pluralize = (word: string, count: number): string => `${count} ${word}${count === 1 ? "" : "s"}`;
</script>

<div class="flex-1 overflow-y-auto">
  {#if form?.message}
    <div class="mx-auto mt-4 w-full max-w-5xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {form.message}
    </div>
  {/if}
  <div class="mx-auto w-full max-w-5xl flex-1 py-6 space-y-6 overflow-y-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-medium tracking-tight">
        {listing.title}
      </h1>
      <div class="flex gap-6">
        <form method="POST" action="?/toggleFavorite">
          <button
            type="submit"
            class="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={16} class={isFavorite ? "text-yellow-500 fill-yellow-500" : ""} />
            <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
          </button>
        </form>
        <!-- TODO: make this do something -->
        <button class="hover:text-zinc-700 transition-colors">
          <Share />
        </button>
      </div>
    </div>
    <!-- TODO: pull these images from supabase bucket, decide on layout -->
    <div class="grid grid-cols-4 gap-4 *:bg-zinc-300 *:aspect-4/3 *:rounded-lg">
      <div class="col-span-2 row-span-2" />
      <div />
      <div />
      <div />
      <div />
    </div>
    <div class="flex justify-between">
      <div>
        <h2 class="text-xl font-medium tracking-tight">
          Property in {listing.city}, Massachussetts 
        </h2>
        <span>
          {pluralize("bed", listing.beds)} · {pluralize("bath", listing.baths)} · {listing.area} sq ft
        </span>
      </div>
      <span class="text-lg font-medium tracking-tight">
        ${listing.price} / mo
      </span>
    </div>

    <div class="flex justify-between">
      <p class="w-1/2">
        {listing.description}
      </p>
      <div class="space-y-2">
        <Perk value={listing.furnished} yes="Furnished" no="Not Furnished" />
        <Perk value={listing.utility} yes="Utility Included" no="Utility Not Included" />
        <Perk value={listing.parking} yes="Parking Available" no="Parking Unavailable" />
      </div>
    </div>

    <!-- TODO: make this do something -->
    <button
      class="rounded-md bg-red-800 hover:bg-red-700 transition-colors px-4 py-1.5 font-medium text-zinc-100"
    >
      Apply
    </button>
  </div>
</div>
