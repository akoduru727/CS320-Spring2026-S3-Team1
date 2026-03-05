<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import { BriefcaseBusiness, User } from "@lucide/svelte";

  const { form } = $props();
</script>

<div class="flex-1 flex flex-col gap-8 items-center justify-center px-4">
  <Card class="space-y-8 p-10">
    <h1 class="text-2xl tracking-tighter font-medium">
      Choose your account type
    </h1>

    <form method="POST" action="?/onboard" class="flex flex-col gap-4 items-center">
      <label class="w-full p-6 flex items-center gap-6 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 ring-2 ring-transparent has-checked:ring-zinc-900 transition-color transition-shadow">
        <input
          type="radio"
          name="account-type"
          value="tenant"
          class="sr-only"
          required
        />
        <User size={40} />
        <div class="text-left">
          <p>
            Tenant
          </p>
          <p class="text-zinc-600">
            I am a tenant looking for a place to live
          </p>
        </div>
      </label>

      <label class="w-full p-6 flex items-center gap-6 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 ring-2 ring-transparent has-checked:ring-zinc-900 transition-color transition-shadow">
        <input
          type="radio"
          name="account-type"
          value="landlord"
          class="sr-only"
        />
        <BriefcaseBusiness size={40} />
        <div class="text-left">
          <p>
            Landlord
          </p>
          <p class="text-zinc-600">
            I am a landlord looking to list my properties
          </p>
        </div>
      </label>

      {#if form?.message}
        <div class="w-full p-2 rounded-md bg-red-500/10 border border-red-500">
          <p class="text-sm text-red-800">
            {form.message}
          </p>
        </div>
      {/if}

      <button type="submit" class="w-full p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-100 tracking-tight font-medium">
        Submit
      </button>
    </form>
  </Card>
</div>
