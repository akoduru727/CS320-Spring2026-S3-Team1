<script lang="ts">
  interface Props {
    class?: string;
    name: string;
    placeholder?: string
    required?: boolean;
  };
  
  const { class: extraClass = "", name, required = false, placeholder = "" }: Props = $props();
</script>


<label class={extraClass}>
    <p>{name}</p>
    <input {required} {placeholder} class="w-full bg-zinc-200 py-1 px-2 rounded"/>
</label>
