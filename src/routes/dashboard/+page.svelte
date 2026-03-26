<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Listing from "./Listing.svelte";
  import Stat from "./Stat.svelte";
</script>

<div class="flex-1 flex overflow-hidden">
  <section class="p-8 space-y-8 flex flex-col flex-1">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-semibold tracking-tighter">
          Dashboard
        </h1>
        <p class="text-zinc-600">
          Manage your listings and view applications.
        </p>
      </div>

    </div>

    <div class="flex-1 flex gap-6 min-h-0">
      <Card class="w-2/3 flex flex-col gap-3 pr-0">
        <div class="flex justify-between pr-6">
          <h2 class="text-2xl font-medium tracking-tight">
            Your listings
          </h2>

          <button class="bg-red-700 hover:bg-red-600 transition-colors text-zinc-100 text-sm font-medium p-2 flex items-center gap-2 rounded">
            <span>
              Post Listing
            </span>
          </button>
        </div>

        <div class="flex w-full flex-col items-stretch gap-3 pr-6 overflow-y-auto">
            {#each {length: 5} as _}
                <Listing name="Kendrick Place" address="123 Kendrick Place" />
            {/each}
        </div>
      </Card>

      <div class="flex-1 flex flex-col gap-3 items-stretch">
        <Stat name="Active Listings" stat={5} unit="Listing"/>
        <Stat name="Pending Applications" stat={10} unit="Application" />
      </div>
    </div>
  </section>
</div>
