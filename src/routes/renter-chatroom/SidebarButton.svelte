<script lang="ts">
	import type { Component } from "svelte";

    interface Props {
        text: string;
        icon?: Component;
        onClick?: () => void;
        active?: boolean;
        count?: number;
    };

    const { text, icon, onClick, active = false, count = 0 }: Props = $props();
    const Icon = $derived(icon);
</script>

<button 
    class = "w-full bg-zinc-200 rounded-lg p-3 flex items-center gap-3 transition-colors cursor-pointer { active? 'bg-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300' }"onclick={onClick}>
    <!-- Icon -->
    {#if Icon}
        <Icon size = {18}></Icon>
    {:else}
        <div class = "w-8 h-8 bg-orange-300 rounded-full"></div>
    {/if}
    <!-- Button Text -->
    <p class = "font-medium text-black">
        {text}
    </p>
    <!-- Notification Count -->
    {#if count > 0}
        <span class="ml-auto min-w-[22px] h-6 px-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {count}
        </span>
    {/if}
</button>