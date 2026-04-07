<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    placeholder?: string
    required?: boolean;
  };
  
  const { class: extraClass = "", name, required = true, placeholder = "" }: Props = $props();
</script>


<label class={extraClass}>
  <p>
    {name}{required ? "*" : ""}
  </p>
  <input 
    {required} 
    {placeholder} 
    class="w-full bg-zinc-200 py-1 px-2 rounded"
  />
</label>
