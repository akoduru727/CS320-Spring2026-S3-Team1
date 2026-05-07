<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Progress from "$lib/components/Progress.svelte";
	import Preference from "./Preference.svelte";
  import { SquarePen } from "@lucide/svelte";
  import Avatar from '$lib/components/Avatar.svelte'

  let profile = {
    avatarUrl: '',
    firstName: 'Amanda'
  }

  const { data, form } = $props();

  const hasSavedPreferences = $derived(Boolean(data.preferences));

  let organization = $state(data.preferences?.organization ?? 0);
  let cleanliness = $state(data.preferences?.cleanliness ?? 0);
  let noise = $state(data.preferences?.noise ?? 0);
  let sleep = $state(data.preferences?.sleep_schedule ?? "no_preference");
  let pets = $state(Boolean(data.preferences?.pets));
  let smoking = $state(Boolean(data.preferences?.smoking));
  let overnight = $state(Boolean(data.preferences?.overnight_guests));
  let cost_preference = $state(data.preferences?.cost_preference ?? "no_preference");
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

    <Card class="flex gap-6">
     <Avatar
       avatarUrl={profile.avatarUrl}
       firstName={profile.firstName}
    />
      <!--<div class="w-24 h-24 rounded-full bg-zinc-200">Text</div>-->
    </Card>

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

  </section>
</div>
