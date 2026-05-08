<script lang="ts">
  import ListingForm from "$lib/components/listings/ListingForm.svelte";

  const { form } = $props();
</script>

<ListingForm
  {form}
  title="Create Listing"
  submitLabel="Submit Listing"
  submitAction="?/create"
/>
