<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    field?: string;
    required?: boolean; 
  };

  const { class: extraClass = "", name, field, required = true }: Props = $props();
</script>

<label class={`col-span-2 flex gap-3 items-center ${extraClass}`}>
  <p>
    {name}{required ? "*" : ""}
  </p>
  <input 
    type="checkbox"
    name={field ?? name}
    value="true"
    {required}
    class="accent-red-800"
  />
</label>
