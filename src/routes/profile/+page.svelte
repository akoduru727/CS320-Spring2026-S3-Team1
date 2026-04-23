<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Progress from "$lib/components/Progress.svelte";
	import Preference from "./Preference.svelte";
  import { SquarePen } from "@lucide/svelte";

  let organization = 0;
  let cleanliness = 0;
  let noise = 0;
  let sleep = "";
  let pets = false;
  let smoking = false;
  let overnight = false;
</script>

<div class="flex-1">
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
      <div class="w-24 h-24 rounded-full bg-zinc-200"></div>
    </Card>

    <form method="POST" action="?/create">
    <Card class="space-y-6">
      <h2 class="text-xl font-semibold tracking-tighter">
        Roommate Preferences
      </h2>

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
            Submit Preferences
        </button>
      </div>
    </Card>
    </form>

  </section>
</div>
