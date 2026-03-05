<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    value: string,
    title: string,
    description: string,
    icon: Snippet,
  };

  const { value, title, description, icon }: Props = $props();
</script>

<label class="w-full p-6 flex items-center gap-6 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 ring-2 ring-transparent has-checked:ring-zinc-900 transition-color transition-shadow">
  <input
    type="radio"
    name="account-type"
    {value}
    class="sr-only"
    required
  />
  {@render icon()}
  <div class="text-left">
    <p>
      {title}
    </p>
    <p class="text-zinc-600">
      {description}
    </p>
  </div>
</label>
