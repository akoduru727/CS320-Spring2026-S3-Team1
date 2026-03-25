<script lang="ts">
  import Card from "$lib/components/Card.svelte";
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
          <Card class="flex items-center gap-6">
            <div class="w-20 h-20 bg-zinc-300" />
            
            <div>
              <p class="font-medium text-lg">
                Kendrick Place
              </p>
              <p>
                57 E Pleasant St, Amherst, MA 01002 
              </p>
            </div>
          </Card>
          <Card class="flex items-center gap-6">
            <div class="w-20 h-20 bg-zinc-300" />
            
            <div>
              <p class="font-medium text-lg">
                Kendrick Place
              </p>
              <p>
                57 E Pleasant St, Amherst, MA 01002 
              </p>
            </div>
          </Card>
          <Card class="flex items-center gap-6">
            <div class="w-20 h-20 bg-zinc-300" />
            
            <div>
              <p class="font-medium text-lg">
                Kendrick Place
              </p>
              <p>
                57 E Pleasant St, Amherst, MA 01002 
              </p>
            </div>
          </Card>
          <Card class="flex items-center gap-6">
            <div class="w-20 h-20 bg-zinc-300" />
            
            <div>
              <p class="font-medium text-lg">
                Kendrick Place
              </p>
              <p>
                57 E Pleasant St, Amherst, MA 01002 
              </p>
            </div>
          </Card>
          <Card class="flex items-center gap-6">
            <div class="w-20 h-20 bg-zinc-300" />
            
            <div>
              <p class="font-medium text-lg">
                Kendrick Place
              </p>
              <p>
                57 E Pleasant St, Amherst, MA 01002 
              </p>
            </div>
          </Card>
        </div>
      </Card>

      <div class="flex-1 flex flex-col gap-3 items-stretch">
        <Card class="space-y-3">
          <p class="font-medium text-zinc-600">
            Active Listings
          </p>
          <p class="text-lg font-medium">
            5 Listings
          </p>
        </Card> 

        <Card class="space-y-3">
          <p class="font-medium text-zinc-600">
            Pending Applications
          </p>
          <p class="text-lg font-medium">
            10 Applications
          </p>
        </Card> 
      </div>
    </div>
  </section>
</div>
