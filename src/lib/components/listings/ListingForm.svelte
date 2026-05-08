<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import { ImagePlus } from "@lucide/svelte";

  type ListingValues = {
    address?: string | null;
    zip_code?: string | null;
    city?: string | null;
    beds?: number | null;
    baths?: number | null;
    area?: number | null;
    price?: number | null;
    available_from?: string | null;
    available_to?: string | null;
    utility?: boolean | null;
    parking?: boolean | null;
    furnished?: boolean | null;
    title?: string | null;
    description?: string | null;
    application_type?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    application_pdf_url?: string | null;
  };

  type ExistingImage = {
    id: string;
    url: string;
    cover: boolean;
  };

  interface Props {
    form?: { message?: string } | null;
    title: string;
    submitLabel: string;
    submitAction: string;
    initialValues?: ListingValues;
    existingImages?: ExistingImage[];
  }

  const {
    form = null,
    title,
    submitLabel,
    submitAction,
    initialValues = {},
    existingImages = [],
  }: Props = $props();

  let images: FileList | undefined = $state();
  const imageCount = $derived(images?.length ?? 0);
  const initialApplicationType = initialValues.application_type ?? "contact";
  let applicationType = $state(initialApplicationType);
  let pdfFile: FileList | undefined = $state();
  const pdfName = $derived(pdfFile && pdfFile.length > 0 ? pdfFile[0].name : null);
</script>

<div class="flex-1 overflow-y-auto">
  <div class="mx-40 py-9 flex flex-col gap-3">
    <h1 class="text-center text-4xl font-semibold tracking-tighter mb-6">
      {title}
    </h1>

    <form method="POST" action={submitAction} enctype="multipart/form-data" class="space-y-6">
      <Card class="grid grid-cols-6 gap-6">
        <p class="col-span-6 text-lg font-medium tracking-tight">
          Information
        </p>

        <label class="col-span-2">
          <p>Street Address*</p>
          <input
            name="address"
            required
            placeholder="123 Main Street"
            value={initialValues.address ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>Zip Code*</p>
          <input
            name="zip_code"
            required
            placeholder="01002"
            pattern={"\\d{5}(?:-\\d{4})?"}
            value={initialValues.zip_code ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>City*</p>
          <input
            name="city"
            required
            placeholder="Amherst"
            value={initialValues.city ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>Bedrooms</p>
          <input
            name="beds"
            type="number"
            placeholder="2"
            value={initialValues.beds ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>Bathrooms</p>
          <input
            name="baths"
            type="number"
            placeholder="1"
            value={initialValues.baths ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>Square Footage</p>
          <input
            name="area"
            type="number"
            placeholder="1200"
            value={initialValues.area ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label>
          <p>Monthly Rent ($)*</p>
          <input
            name="price"
            required
            type="number"
            placeholder="2000"
            value={initialValues.price ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label class="col-span-2">
          <p>Available From</p>
          <input
            name="available_from"
            type="date"
            value={initialValues.available_from ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label class="col-span-2">
          <p>Available To</p>
          <input
            name="available_to"
            type="date"
            value={initialValues.available_to ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label class="col-span-2 flex gap-3 items-center">
          <p>Utility Included</p>
          <input
            type="checkbox"
            name="utility"
            value="true"
            checked={initialValues.utility ?? false}
            class="accent-red-800"
          />
        </label>

        <label class="col-span-2 flex gap-3 items-center">
          <p>Parking Available</p>
          <input
            type="checkbox"
            name="parking"
            value="true"
            checked={initialValues.parking ?? false}
            class="accent-red-800"
          />
        </label>

        <label class="col-span-2 flex gap-3 items-center">
          <p>Is Furnished</p>
          <input
            type="checkbox"
            name="furnished"
            value="true"
            checked={initialValues.furnished ?? false}
            class="accent-red-800"
          />
        </label>
      </Card>

      <Card class="grid grid-cols-6 gap-6">
        <p class="col-span-6 text-lg font-medium tracking-tight">
          Details
        </p>

        <label class="col-span-2">
          <p>Title*</p>
          <input
            name="title"
            required
            value={initialValues.title ?? ""}
            class="w-full bg-zinc-200 py-1 px-2 rounded"
          />
        </label>

        <label class="col-span-2">
          <p>Description</p>
          <textarea
            name="description"
            class="w-full bg-zinc-200 p-1 rounded"
            rows={3}
          >{initialValues.description ?? ""}</textarea>
        </label>

        <label class="col-span-2">
          <p>Upload Images</p>
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
              : "No new photos selected"}
          </p>
        </label>

        {#if existingImages.length > 0}
          <div class="col-span-6 space-y-3">
            <p>Existing Images</p>
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              {#each existingImages as image}
                <label class="space-y-2 rounded border border-zinc-200 p-2">
                  <img
                    src={image.url}
                    alt="Listing"
                    class="aspect-[4/3] w-full rounded object-cover"
                  />
                  <div class="flex items-center justify-between text-sm">
                    <span class="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cover_image_id"
                        value={image.id}
                        checked={image.cover}
                      />
                      Cover
                    </span>
                    <span class="flex items-center gap-2">
                      <input type="checkbox" name="remove_image_ids" value={image.id} />
                      Remove
                    </span>
                  </div>
                </label>
              {/each}
            </div>
          </div>
        {/if}
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
          <label class="col-span-3">
            <p>Contact Email*</p>
            <input
              name="contact_email"
              required={applicationType === "contact"}
              placeholder="landlord@example.com"
              value={initialValues.contact_email ?? ""}
              class="w-full bg-zinc-200 py-1 px-2 rounded"
            />
          </label>

          <label class="col-span-3">
            <p>Contact Phone</p>
            <input
              name="contact_phone"
              placeholder="(555) 123-4567"
              value={initialValues.contact_phone ?? ""}
              class="w-full bg-zinc-200 py-1 px-2 rounded"
            />
          </label>
        {/if}

        {#if applicationType === "pdf"}
          <label class="col-span-6">
            <p>Application PDF</p>
            {#if initialValues.application_pdf_url}
              <p class="mt-1 text-xs text-zinc-600">
                Current PDF:
                <a
                  href={initialValues.application_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  class="text-red-800 underline"
                >
                  View current file
                </a>
              </p>
            {/if}
            <label
              for="pdf-upload"
              class="mt-1 flex items-center justify-center gap-2 rounded bg-zinc-200 hover:bg-zinc-300 px-4 py-4 text-sm text-zinc-700 cursor-pointer transition-colors"
            >
              <span>{pdfName ? "Change file" : "Choose PDF"}</span>
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
              {pdfName ?? (initialValues.application_pdf_url ? "Keep current PDF" : "No file selected")}
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
          {submitLabel}
        </button>
      </div>
    </form>
  </div>
</div>
