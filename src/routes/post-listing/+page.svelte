<script lang="ts">
  import Card from "$lib/components/Card.svelte";
</script>

<div class="flex-1 mx-40 py-12 flex flex-col gap-3">
  <h1 class="text-center text-4xl font-medium">
    Property Listing Questionnaire
  </h1>

  <h2 class="text-center text-md text-zinc-600">
    Fill out the details below to create your property listing
  </h2>

  <form>
    <Card class="grid grid-cols-6 gap-6">
      <p class="col-span-6 text-lg font-medium tracking-tight mb-3">
        Property Details
      </p>
      
      <label class="col-span-3">
        <p>Street Address*</p>
        <input 
          placeholder="123 Main Street"
          class="w-full bg-zinc-200 py-1 px-2 rounded"
        />
      </label>

      <label class="col-span-1">
        <p>Bedrooms*</p>
        <input 
          placeholder="2"
          class="w-full bg-zinc-200 py-1 px-2 rounded"
        />
      </label>

      <label class="col-span-1">
        <p>Bathrooms*</p>
        <input 
          placeholder="1"
          class="w-full bg-zinc-200 py-1 px-2 rounded"
        />
      </label>

      <label class="col-span-1">
        <p>Square Feet*</p>
        <input 
          placeholder="1200"
          class="w-full bg-zinc-200 py-1 px-2 rounded"
        />
      </label>
    </Card>
  </form>
</div>
