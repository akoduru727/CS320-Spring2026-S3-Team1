<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import TextInput from "./TextInput.svelte";
  import CheckboxInput from "./CheckboxInput.svelte";
</script>

<div class="flex-1 mx-40 py-12 flex flex-col gap-3">
  <h1 class="text-center text-4xl font-medium">
    Property Listing Questionnaire
  </h1>

  <h2 class="text-center text-md text-zinc-600 mb-6">
    Fill out the details below to create your property listing
  </h2>

  <form class="space-y-6">
    <Card class="grid grid-cols-6 gap-6">
      <p class="col-span-6 text-lg font-medium tracking-tight">
        Information
      </p>
      
      <TextInput
        name="Street Address"
        placeholder="123 Main Street"
        class="col-span-2"
      />

      <TextInput
        name="Zip Code"      
        placeholder="01002"
      />

      <TextInput
        name="City"      
        placeholder="Amherst"
      />

      <TextInput
        name="Bedrooms"
        placeholder="2"
      />

      <TextInput
        name="Bathrooms"
        placeholder="1"
      />

      <TextInput
        name="Square Footage"
        placeholder="1200"
      />
      
      <TextInput
        name="Monthly Rent ($)"
        placeholder="2000"
      />

      <TextInput
        name="Available From"
        placeholder="mm/dd/yyyy"
        class="col-span-2"
      />

      <TextInput
        name="Available To"
        placeholder="mm/dd/yyyy"
        class="col-span-2"
      />

      <CheckboxInput
        name="Utility Included"
        class="col-span-2"
      />

      <CheckboxInput
        name="Parking Available"
        class="col-span-2"
      />

      <CheckboxInput
        name="Is Furnished"
        class="col-span-2"
      />
    </Card>

    <Card class="grid grid-cols-6 gap-6">
      <p class="col-span-6 text-lg font-medium tracking-tight">
        Details
      </p>

      <TextInput
        name="Title"
        required
        class="col-span-2"
      />

      <label class="col-span-4">
        <p>
          Description 
        </p>
        <textarea 
          class="w-full bg-zinc-200 p-1 rounded"
          rows={3}
        ></textarea>
      </label>
    </Card>
  </form>
</div>
