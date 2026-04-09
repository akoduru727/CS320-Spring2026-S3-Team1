<script lang="ts">
    interface Props {
        min: string;
        max: string;
        value: number;
        unit: string;
    };
    let {min, max, value = $bindable(), unit}:Props = $props();
    let unitStr:string = $derived.by(() => {
        if(value == 0) {
            return "Any # " + unit + "s";
        } else {
            return value + " " + unit + (value != 1 ? "s" : "");
        }
    })
</script>

<div class="flex justify-between">
    <input type=range {min} {max} bind:value={value} class="w-2/3" />
    <h2 class="justify-center">{unitStr}</h2>
</div>
