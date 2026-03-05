<script lang="ts">
  import Card from "$lib/components/Card.svelte";

  const { data, form } = $props();
</script>

<div class="flex-1 flex items-center justify-center px-4">
  <Card class="min-w-md space-y-6 p-10">
    <div class="space-y-1 text-center">
      <h1 class="text-2xl font-semibold tracking-tighter">Sign in</h1>
      <p class="text-sm text-zinc-600">Use your Google account to continue.</p>
    </div>

    {#if data.authError || form?.message}
      <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {form?.message || data.authError}
      </p>
    {/if}

    <form method="POST" action="?/google">
      <button
        type="submit"
        class="w-full p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-100 tracking-tight font-medium"
      >
        Continue with Google
      </button>
    </form>
  </Card>
</div>
