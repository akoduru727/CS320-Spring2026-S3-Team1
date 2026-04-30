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
            return "Any # " + unit + "s ";
        } else {
            return value + " " + unit + (value != 1 ? "s " : " ");
        }
    })
    let unitEmoji: Record<string, string> = {
        "Bath": "🛁",
        "Bed": "🛏️",
        "Mile": "🚗"
    };
</script>

<div class="flex-1">
    <input type=range {min} {max} bind:value={value} class="w-full accent-red-500" />
    <div class="flex">
        <h2 class="">{unitStr}</h2>
        {#each Array(value) as _}
        <h1>{unitEmoji[unit]}</h1>
        {/each}
    </div>
</div>
