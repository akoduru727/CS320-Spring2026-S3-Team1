<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import TextInput from "./TextInput.svelte";
  import CheckboxInput from "./CheckboxInput.svelte";
</script>

<div class="flex-1 overflow-y-auto">
  <div class="mx-40 py-12 flex flex-col gap-3">
    <h1 class="text-center text-4xl font-medium">
      Property Listing Questionnaire
    </h1>

    <h2 class="text-center text-md text-zinc-600 mb-6">
      Fill out the details below to create your property listing
    </h2>

    <form enctype="multipart/form-data" class="space-y-6">
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
          pattern="^\d{5}(?:-\d{4})?$"
        />

        <TextInput
          name="City"      
          placeholder="Amherst"
        />

        <TextInput
          name="Bedrooms"
          placeholder="2"
          type="number"
        />

        <TextInput
          name="Bathrooms"
          placeholder="1"
          type="number"
        />

        <TextInput
          name="Square Footage"
          placeholder="1200"
          type="number"
        />
        
        <TextInput
          name="Monthly Rent ($)"
          placeholder="2000"
          type="number"
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

        <label class="col-span-2">
          <p>
            Description 
          </p>
          <textarea 
            class="w-full bg-zinc-200 p-1 rounded"
            rows={3}
          ></textarea>
        </label>

        <label class="col-span-2">
          <p>
            Upload Images*
          </p>
          <input 
            type="file" 
            id="imageUpload" 
            name="imageUpload" 
            accept="image/*"
            multiple
            class="bg-zinc-200 rounded-2xl w-full"
          >
        </label>
      </Card>
    </form>
  </div>
</div>
