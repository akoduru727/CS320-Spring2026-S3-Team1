<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Progress from "$lib/components/Progress.svelte";
	import Preference from "./Preference.svelte";
  import { SquarePen } from "@lucide/svelte";

  const { data, form } = $props();

  const hasSavedPreferences = $derived(Boolean(data.preferences));
  const hasName = $derived(Boolean((data.tenantName ?? "").trim()));

  let organization = $state(data.preferences?.organization ?? 0);
  let cleanliness = $state(data.preferences?.cleanliness ?? 0);
  let noise = $state(data.preferences?.noise ?? 0);
  let sleep = $state(data.preferences?.sleep_schedule ?? "flexible");
  let pets = $state(Boolean(data.preferences?.pets));
  let smoking = $state(Boolean(data.preferences?.smoking));
  let overnight = $state(Boolean(data.preferences?.overnight_guests));
  let name = $state(data.tenantName ?? "");
</script>

<div class="flex-1 overflow-y-auto">
  <section class="max-w-4xl h-full mx-auto p-8 space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-semibold tracking-tighter">
          Profile
        </h1>
        <p class="text-zinc-600">
          Manage your profile and roommate preferences.
        </p>
      </div>

      <button class="bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-100 text-sm p-2 flex items-center gap-2 rounded">
        <SquarePen size={16} />
        <span>
          Edit Profile
        </span>
      </button>
    </div>

    <form method="POST" action="?/updateName">
      <Card class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold tracking-tighter">Display name</h2>
            <p class="text-sm text-zinc-600">
              Landlords will see this name on applications.
            </p>
          </div>
          {#if hasName}
            <span class="rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-medium text-green-900">
              Set
            </span>
          {:else}
            <span class="rounded-full bg-red-600/10 px-2.5 py-1 text-xs font-medium text-red-900">
              Required
            </span>
          {/if}
        </div>

        {#if data.tenantNameMessage}
          <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {data.tenantNameMessage}
          </div>
        {/if}

        {#if form?.nameFormMessage}
          <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {form.nameFormMessage}
          </div>
        {/if}

        <label class="block space-y-1">
          <p class="text-sm font-medium text-zinc-700">Name</p>
          <input
            name="name"
            bind:value={name}
            autocomplete="name"
            class="w-full rounded-md border border-zinc-300 bg-zinc-200 px-3 py-2 text-sm"
            placeholder="e.g. Jane Doe"
          />
        </label>

        <div class="flex justify-end">
          <button type="submit" class="bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-100 text-sm font-medium px-4 py-2 rounded">
            Save name
          </button>
        </div>
      </Card>
    </form>

    <form method="POST" action="?/create">
    <Card class="space-y-6">
      <h2 class="text-xl font-semibold tracking-tighter">
        Roommate Preferences
      </h2>

      {#if data.message || form?.message}
        <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {form?.message || data.message}
        </div>
      {/if}

      {#if hasSavedPreferences}
        <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Preferences saved. Update anything below and resubmit to change them.
        </div>
      {/if}

      <div class="space-y-3">
        <Preference
          name="Organization"
          description="How organized are you with shared spaces?"
        />
        <Progress level={organization} max={5} onChange = {(val) => organization = val}/>
      </div>

      <input type="hidden" name="organization" value= {organization}>

      <div class="space-y-3">
        <Preference
          name="Cleanliness"
          description="How important is cleanliness to you?"
        />
        <Progress level={cleanliness} max={5} onChange = {(val) => cleanliness = val}/>
      </div>

      <input type="hidden" name="cleanliness" value= {cleanliness}>

      <div class="space-y-3">
        <Preference
          name="Noise"
          description="How comfortable are you with noise?"
        />
        <Progress level={noise} max={5} onChange = {(val) => noise = val}/>
      </div>

      <input type="hidden" name="noise" value= {noise}>

      <Preference
        name="Sleep Schedule"
        description="When do you typically go to bed?"
      >
        <div class="space-x-1">
          <select bind:value={sleep} name="sleep" id="sleep" class="tracking-tighter">
            <option value = "early">Early</option>
            <option value = "late">Late</option>
            <option value = "flexible">Flexible</option>
          </select>
        </div>
      </Preference>

      <Preference
        name="Pet Friendly"
        description="Are you comfortable living with pets?"
      >
        <input type="checkbox" name = "pets" value = "true" bind:checked={pets}>
      </Preference>

      <Preference
        name="Smoking"
        description="Do you smoke?"
      >
        <input type="checkbox" name = "smoking" value = "true" bind:checked={smoking}>
      </Preference>

      <Preference
        name="Overnight Guests"
        description="Are you comfortable with overnight guests?"
      >
        <input type="checkbox" name = "overnight" value = "true" bind:checked={overnight}>
      </Preference>
      <div class="flex justify-center">
        <button type="submit" class="bg-red-800 hover:bg-red-700 cursor-pointer transition-colors text-zinc-100 text-sm font-medium px-4 py-2 rounded ">
            {hasSavedPreferences ? "Update Preferences" : "Submit Preferences"}
        </button>
      </div>
    </Card>
    </form>

  </section>
</div>
