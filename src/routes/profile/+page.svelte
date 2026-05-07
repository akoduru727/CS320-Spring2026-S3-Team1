	<script lang="ts">
	  import { onMount } from "svelte";
	  import Card from "$lib/components/Card.svelte";
	  import Progress from "$lib/components/Progress.svelte";
		import Preference from "./Preference.svelte";
	  import Avatar from "$lib/components/Avatar.svelte";
	
  const { data, form } = $props();

  const isTenantMode = $derived(data.mode === "tenant");
  const hasSavedPreferences = $derived(Boolean(data.preferences));
  const hasName = $derived(Boolean((data.profileName ?? "").trim()));
  const showNameSaved = $derived(data.saved === "name");
  const showPreferencesSaved = $derived(data.saved === "preferences");

  let organization = $state(0);
  let cleanliness = $state(0);
  let noise = $state(0);
  let sleep = $state("no_preference");
  let pets = $state(false);
  let smoking = $state(false);
  let overnight = $state(false);
  let cost_preference = $state("no_preference");
  let name = $state("");

  $effect(() => {
    organization = data.preferences?.organization ?? 0;
    cleanliness = data.preferences?.cleanliness ?? 0;
    noise = data.preferences?.noise ?? 0;
    sleep = data.preferences?.sleep_schedule ?? "no_preference";
    pets = Boolean(data.preferences?.pets);
    smoking = Boolean(data.preferences?.smoking);
    overnight = Boolean(data.preferences?.overnight_guests);
    cost_preference = data.preferences?.cost_preference ?? "no_preference";
    name = data.profileName ?? "";
  });

  onMount(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("saved")) return;
    url.searchParams.delete("saved");
    window.history.replaceState({}, "", url);
  });
</script>

<div class="flex-1 overflow-y-auto">
  <section class="max-w-4xl h-full mx-auto p-8 space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-semibold tracking-tighter">
          Profile
        </h1>
        <p class="text-zinc-600">
          {isTenantMode ? "Manage your profile and roommate preferences." : "Manage your profile details."}
        </p>
      </div>
    </div>

    <form method="POST" action="?/updateName">
      <Card class="space-y-4 bg-white/80 backdrop-blur shadow-sm">
	        <div class="flex items-start justify-between gap-4">
		          <div class="flex items-center gap-5">
		            <Avatar
		              avatarUrl=""
		              firstName={data.profileName || "A"}
		            />
	            <div class="space-y-1">
	              <h2 class="text-xl font-semibold tracking-tighter">Display Name</h2>
	              <p class="text-sm text-zinc-600">
	                {isTenantMode
	                  ? "Landlords will see this name on applications."
	                  : "Tenants will see this name on your listings and applications."}
	              </p>
	            </div>
	          </div>
	          <div class="space-y-1">
	            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Status</p>
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
	        </div>

        {#if showNameSaved}
          <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
            Name saved.
          </div>
        {/if}

        {#if data.profileNameMessage}
          <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {data.profileNameMessage}
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
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            placeholder="e.g. Jane Doe"
          />
        </label>

	        <div class="flex justify-end">
	          <button type="submit" class="bg-zinc-900 hover:bg-zinc-700 transition-colors text-zinc-100 text-sm font-medium px-4 py-2 rounded">
	            Save Name
	          </button>
	        </div>
      </Card>
	    </form>
    {#if isTenantMode}
		    <form method="POST" action="?/create">
    <Card class="space-y-6 bg-white/80 backdrop-blur shadow-sm">
      <h2 class="text-xl font-semibold tracking-tighter">
        Roommate Preferences
      </h2>

      {#if data.message || form?.message}
        <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {form?.message || data.message}
        </div>
      {/if}

      {#if showPreferencesSaved}
        <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Preferences saved. Update anything below and resubmit to change them.
        </div>
      {/if}

      <div class="space-y-3">
        <Preference
          name="Organization"
          description="How important is organization in a shared space to you?"
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
            <option value = "no_preference">No Preference</option>            
            <option value = "before_nine">Before 9 PM</option>
            <option value = "nine_to_ten">9 PM to 10 PM</option>
            <option value = "ten_to_eleven">10 PM to 11 PM</option>
            <option value = "eleven_to_twelve">11 PM to 12 AM</option>
            <option value = "later_than_twelve">Later than 12 AM</option>
            
          </select>
        </div>
      </Preference>

      <!-- sleep-time type values: before_nine, nine_to_ten, ten_to_eleven, eleven_to_twelve, later_than_twelve, no_preference -->

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

      <Preference
        name="Monthly Cost Preference"
        description="How much are you willing to pay per month for rent individually?"
      >
        <div class="space-x-1">
          <select bind:value={cost_preference} name="cost_preference" id="cost_preference" class="tracking-tighter">
            <option value = "no_preference">No Preference</option>
            <option value = "under_1000">Under $1000</option>
            <option value = "under_1200">Under $1200</option>
            <option value = "under_1500">Under $1500</option>
          </select>
        </div>
      </Preference>

      <div class="flex justify-center">
        <button type="submit" class="bg-red-800 hover:bg-red-700 cursor-pointer transition-colors text-zinc-100 text-sm font-medium px-4 py-2 rounded ">
            {hasSavedPreferences ? "Update Preferences" : "Submit Preferences"}
        </button>
      </div>
    </Card>
	    </form>
    {/if}

  </section>
</div>
