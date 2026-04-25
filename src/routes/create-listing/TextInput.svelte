<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    field?: string;
    placeholder?: string
    required?: boolean;
    pattern?: string;
    type?: string;
  };
  
  const { 
    class: extraClass = "", 
    name, 
    field, 
    required = true, 
    placeholder = "", 
    pattern, 
    type = "text" 
  }: Props = $props();

  const inputName = field ?? name;
</script>


<label class={extraClass}>
  <p>
    {name}{required ? "*" : ""}
  </p>
  <input 
    name={inputName}
    {required} 
    {placeholder} 
    {pattern}
    {type}
    class="w-full bg-zinc-200 py-1 px-2 rounded"
  />
</label>
