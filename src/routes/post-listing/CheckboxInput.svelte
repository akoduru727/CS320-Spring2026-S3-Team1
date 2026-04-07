<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    required?: boolean; 
  };

  const { class: extraClass = "", name, required = true }: Props = $props();
</script>

<label class="col-span-2 flex gap-3 items-center">
  <p>
    {name}{required ? "*" : ""}
  </p>
  <input 
    type="checkbox"
    class="accent-red-800"
  />
</label>
