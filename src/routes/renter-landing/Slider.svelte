<script lang="ts">
    interface Props {
        min: string;
        max: string;
        value: number;
        unit: string;
    };
    let {min, max, value = $bindable(), unit}:Props = $props();
</script>

<div>
    <input type=range {min} {max} bind:value />
    <h2>{value} {unit}{value != 1 ? "s" : ""}</h2>
</div>
