<script lang="ts">
    import { PersonStanding } from "@lucide/svelte";
    interface Props {
        name: string;
        pinned?: boolean;
        onClick?: () => void;
        unreadCount?: number;
    };
    const { name, pinned = false, onClick, unreadCount = 0 }: Props = $props();
</script>

<button class="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-zinc-300 active:scale-[0.98] active:bg-zinc-400 transition-all duration-100 cursor-pointer" onclick = {onClick}>
    <!-- Profile Pic -->
    {#if pinned}
        <div class= "w-8 h-8 bg-blue-400 rounded-full shrink-0 flex items-center justify-center">
            <PersonStanding size={16} class="text-white"/>
        </div>
    {:else}
         <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
            <span class="text-white text-sm font-semibold">{name[0].toUpperCase()}</span>
         </div>
    {/if}
    <!-- Name -->
    <p class = "text-black font-medium truncate">
        {name}
    </p>
    <!-- Unread Count -->
    {#if unreadCount > 0}
        <span class="ml-auto min-w-[22px] h-6 px-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
        </span>
    {/if}
</button>