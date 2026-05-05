<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import TextInput from "./TextInput.svelte";
  import CheckboxInput from "./CheckboxInput.svelte";
  import { ImagePlus } from "@lucide/svelte";

  const { form } = $props();

  let images: FileList | undefined = $state();
  const imageCount = $derived(images?.length ?? 0);
  let applicationType = $state("contact");
  let pdfFile: FileList | undefined = $state();
  const pdfName = $derived(
    pdfFile && pdfFile.length > 0 ? pdfFile[0].name : null
  );
</script>

<div class="flex-1 overflow-y-auto">
  <div class="mx-40 py-9 flex flex-col gap-3">
    <h1 class="text-center text-4xl font-semibold tracking-tighter mb-6">
      Create Listing
    </h1>

    <form method="POST" action="?/create" enctype="multipart/form-data" class="space-y-6">
      <Card class="grid grid-cols-6 gap-6">
        <p class="col-span-6 text-lg font-medium tracking-tight">
          Information
        </p>
        
        <TextInput
          name="Street Address"
          field="address"
          placeholder="123 Main Street"
          class="col-span-2"
        />

        <TextInput
          name="Zip Code"
          placeholder="01002"
          field="zip_code"
          pattern={"\\d{5}(?:-\\d{4})?"}
          required={false}
        />

        <TextInput
          name="City"      
          placeholder="Amherst"
          field="city"
        />

        <TextInput
          name="Bedrooms"
          placeholder="2"
          type="number"
          field="beds"
          required={false}
        />

        <TextInput
          name="Bathrooms"
          placeholder="1"
          type="number"
          field="baths"
          required={false}
        />

        <TextInput
          name="Square Footage"
          placeholder="1200"
          type="number"
          field="area"
          required={false}
        />
        
        <TextInput
          name="Monthly Rent ($)"
          placeholder="2000"
          type="number"
          field="price"
        />

        <TextInput
          name="Available From"
          placeholder="yyyy-mm-dd"
          type="date"
          class="col-span-2"
          field="available_from"
          required={false}
        />

        <TextInput
          name="Available To"
          placeholder="yyyy-mm-dd"
          type="date"
          class="col-span-2"
          field="available_to"
          required={false}
        />

        <CheckboxInput
          name="Utility Included"
          class="col-span-2"
          field="utility"
          required={false}
        />

        <CheckboxInput
          name="Parking Available"
          class="col-span-2"
          field="parking"
          required={false}
        />

        <CheckboxInput
          name="Is Furnished"
          class="col-span-2"
          field="furnished"
          required={false}
        />
      </Card>

      <Card class="grid grid-cols-6 gap-6">
        <p class="col-span-6 text-lg font-medium tracking-tight">
          Details
        </p>

        <TextInput
          name="Title"
          field="title"
          required
          class="col-span-2"
        />

        <label class="col-span-2">
          <p>
            Description 
          </p>
          <textarea 
            name="description"
            class="w-full bg-zinc-200 p-1 rounded"
            rows={3}
          ></textarea>
        </label>

        <label class="col-span-2">
          <p>
            Upload Images*
          </p>
          <label
            for="image-upload"
            class="mt-1 flex items-center justify-center gap-2 rounded bg-zinc-200 hover:bg-zinc-300 px-4 py-6 text-sm text-zinc-700 transition-colors"
          >
            <ImagePlus size={18} />
            <span>Click to upload photos</span>
          </label>
          <input
            type="file"
            id="image-upload"
            name="images"
            accept="image/*"
            multiple
            class="hidden"
            bind:files={images}
          />
          <p class="mt-2 text-xs text-zinc-600" aria-live="polite">
            {imageCount > 0
              ? `${imageCount} photo${imageCount === 1 ? "" : "s"} selected`
              : "No photos selected"}
          </p>
        </label>
      </Card>

      <Card class="grid grid-cols-6 gap-6">
        <p class="col-span-6 text-lg font-medium tracking-tight">
          Application Method
        </p>

        <label class="col-span-3 flex items-center gap-2">
          <input
            type="radio"
            name="application_type"
            value="contact"
            bind:group={applicationType}
          />
          <span>Share contact information</span>
        </label>

        <label class="col-span-3 flex items-center gap-2">
          <input
            type="radio"
            name="application_type"
            value="pdf"
            bind:group={applicationType}
          />
          <span>Upload PDF application</span>
        </label>

        {#if applicationType === "contact"}
          <TextInput
            name="Contact Email"
            field="contact_email"
            placeholder="landlord@example.com"
            class="col-span-3"
          />

          <TextInput
            name="Contact Phone"
            field="contact_phone"
            placeholder="(555) 123-4567"
            class="col-span-3"
            required={false}
          />
        {/if}

        {#if applicationType === "pdf"}
          <label class="col-span-6">
            <p>Application PDF</p>
          <label
            for="pdf-upload"
            class="mt-1 flex items-center justify-center gap-2 rounded bg-zinc-200 hover:bg-zinc-300 px-4 py-4 text-sm text-zinc-700 cursor-pointer transition-colors"
          >
            <span>
              {pdfName ? "Change file" : "Choose PDF"}
            </span>
          </label>
            <input
              id="pdf-upload"
              type="file"
              name="application_pdf"
             accept="application/pdf"
             class="hidden"
             bind:files={pdfFile}
            />

            <p class="mt-2 text-xs text-zinc-600">
             {pdfName ?? "No file selected"}
            </p>
          </label>
        {/if}
      </Card>

      {#if form?.message}
        <Card class="border border-red-500 bg-red-500/10">
          <p class="text-sm text-red-800">
            {form.message}
          </p>
        </Card>
      {/if}

      <div class="flex justify-center">
        <button 
          type="submit" 
          class="bg-red-800 hover:bg-red-700 transition-colors text-zinc-100 text-sm font-medium px-4 py-2 rounded"
        >
          Submit Listing
        </button>
      </div>
    </form>
  </div>
</div>
