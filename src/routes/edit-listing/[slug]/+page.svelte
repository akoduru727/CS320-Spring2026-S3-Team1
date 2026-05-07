<script lang="ts">
  import ListingForm from "$lib/components/listings/ListingForm.svelte";

  const { data, form } = $props();
</script>

<ListingForm
  {form}
  title="Edit Listing"
  submitLabel="Save Changes"
  submitAction="?/update"
  initialValues={data.listing}
  existingImages={data.listingImages}
/>
