<script lang="ts">
  import Perk from "./Perk.svelte";
  import { Share, Star, Mail, ChevronLeft, ChevronRight } from "@lucide/svelte";
  import { page } from "$app/state";
  import { pluralize } from "$lib/pluralize";

  const { data, form } = $props();    
  const listing = $derived(data.listing);
  const listingImages = $derived(data.listingImages);
  const isFavorite = $derived(data.isFavorite);
  const placeholderImage = "/listing-placeholder.png";
  const hasImages = $derived(listingImages.length > 0);
  const carouselImages = $derived(
    hasImages
      ? listingImages
      : [{ id: "placeholder", url: placeholderImage, cover: true }],
  );
  const hasApplied = $derived(data.hasApplied);

  let copied = $state(false);
  let currentImageIndex = $state(0);

  const selectImage = (index: number) => {
    currentImageIndex = index;
  };

  const showPreviousImage = () => {
    currentImageIndex = currentImageIndex === 0
      ? carouselImages.length - 1
      : currentImageIndex - 1;
  };

  const showNextImage = () => {
    currentImageIndex = currentImageIndex === carouselImages.length - 1
      ? 0
      : currentImageIndex + 1;
  };

  const copyLink = async () => {
    if (!navigator.clipboard) {
      alert("Clipboard unsupported in this environment.");
      return;
    }

    try {
      await navigator.clipboard.writeText(page.url.href);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 3000);
    } catch {
      alert("Failed to copy URL to clipboard.");
      return;
    }
  };
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
      <div class="flex gap-3">
        <form method="POST" action="?/toggleFavorite">
          <button
            type="submit"
            class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-zinc-100 hover:bg-zinc-50 border border-zinc-300 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={16} class={isFavorite ? "text-yellow-500 fill-yellow-500" : ""} />
            <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
          </button>
        </form>
        <button 
          onclick={copyLink}
          disabled={copied}
          class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-zinc-100 hover:bg-zinc-50 transition-colors border border-zinc-300 disabled:opacity-50"
        >
          <Share size={16} />
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
        <!-- TODO: make this do something -->
        <button 
          class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-zinc-100 hover:bg-zinc-50 transition-colors border border-zinc-300"
        >
          <Mail size={16} />
          <span>Contact</span>
        </button>
      </div>
    </div>
    <div class="space-y-4">
      <div class="relative overflow-hidden rounded-lg bg-zinc-200">
        <img
          src={carouselImages[currentImageIndex].url}
          alt={listing.title}
          class="aspect-[16/9] w-full {hasImages ? 'object-cover' : 'object-contain p-16'}"
        />

        {#if carouselImages.length > 1}
          <button
            type="button"
            onclick={showPreviousImage}
            class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-zinc-900 shadow-sm transition-colors hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onclick={showNextImage}
            class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-zinc-900 shadow-sm transition-colors hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        {/if}
      </div>

      {#if carouselImages.length > 1}
        <div class="flex justify-center gap-2">
          {#each carouselImages as carouselImage, index (`${carouselImage}-${index}`)}
            <button
              type="button"
              onclick={() => selectImage(index)}
              class="h-2.5 w-2.5 rounded-full transition-colors {index === currentImageIndex ? 'bg-red-800' : 'bg-zinc-300 hover:bg-zinc-400'}"
              aria-label={"Show image " + (index + 1)}
            >
            </button>
          {/each}
        </div>
      {/if}
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

    {#if !hasApplied}

      <a
        href={`/application-portal?listing_id=${listing.id}`}
        class="inline-flex rounded-md bg-red-800 hover:bg-red-700 px-4 py-1.5 font-medium text-zinc-100"
      >
        Apply
      </a>

    {:else}

      <div class="text-red-800 font-medium">
        Applied ✓
      </div>

      {#if listing.application_type === "contact"}
        <div class="text-sm text-zinc-700 mt-2">
          <p><strong>Email:</strong> {listing.contact_email}</p>

          {#if listing.contact_phone}
            <p><strong>Phone:</strong> {listing.contact_phone}</p>
          {/if}
        </div>
      {/if}

        {#if listing.application_type === "pdf"}
          <a
            href={listing.application_pdf_url}
            target="_blank"
            class="text-red-600 hover:underline text-sm mt-2 block"
          >
            View Application PDF
          </a>
        {/if}

      {/if}
    </div>
</div>
