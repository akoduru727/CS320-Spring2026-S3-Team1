<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Progress from "$lib/components/Progress.svelte";
  import Preference from "./Preference.svelte";
  import { Check, SquarePen, X } from "@lucide/svelte";
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

    <Card class="space-y-6">
      <h2 class="text-xl font-semibold tracking-tighter">
        Roommate Preferences
      </h2>

      <div class="space-y-3">
        <Preference
          name="Organization Level"
          description="How organized are you with shared spaces?"
        />
        <Progress level={3} max={5}/>
      </div>

      <div class="space-y-3">
        <Preference
          name="Cleanliness"
          description="How important is cleanliness to you?"
        />
        <Progress level={4} max={5}/>
      </div>

      <div class="space-y-3">
        <Preference
          name="Noise Tolerance"
          description="How comfortable are you with noise?"
        />
        <Progress level={2} max={5}/>
      </div>

      <Preference
        name="Sleep Schedule"
        description="When do you typically go to bed?"
      >
        <div class="space-x-1">
          <span class="bg-zinc-200 px-3 py-1 rounded-full text-sm tracking-tight">
            Flexible
          </span>
        </div>
      </Preference>

      <Preference
        name="Pet Friendly"
        description="Are you comfortable living with pets?"
      >
        <div class="p-1 bg-red-500/20 rounded-md text-red-800">
          <X size={16} />
        </div>
      </Preference>

      <Preference
        name="Smoking"
        description="Do you smoke?"
      >
        <div class="p-1 bg-green-500/20 rounded-md text-green-800">
          <Check size={16} />
        </div>
      </Preference>
    </Card>
  </section>
</div>
