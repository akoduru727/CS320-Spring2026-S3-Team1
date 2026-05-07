<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex-1 flex flex-col gap-3 justify-center items-center">
  <h1 class="text-[5rem]">
    {page.status}
  </h1>
  {#if page.status === 404}
    <h2 class="text-3xl">
      Sorry! We couldn't find that page.
    </h2>
    <h3 class="text-xl">
      Maybe we can help you 
      <a href="/" class="text-blue-500">
        find somewhere to stay
      </a>?
    </h3>
  {:else}
    <h2 class="text-3xl">
      {page.error?.message ?? "Something went wrong."}
    </h2>
  {/if}
</div>
