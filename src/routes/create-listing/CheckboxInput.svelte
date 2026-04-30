<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    field?: string;
    required?: boolean; 
  };

  const { class: extraClass = "", name, field, required = true }: Props = $props();

  const inputName = field ?? name;
</script>

<label class={`col-span-2 flex gap-3 items-center ${extraClass}`}>
  <p>
    {name}{required ? "*" : ""}
  </p>
  <input 
    type="checkbox"
    name={inputName}
    value="true"
    {required}
    class="accent-red-800"
  />
</label>
