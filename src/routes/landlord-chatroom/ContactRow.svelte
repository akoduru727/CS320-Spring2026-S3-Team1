<script lang="ts">
    import {MessageSquare, EllipsisVertical} from "@lucide/svelte";
    interface Props {
        name: string;
        unreadCount?: number;
        onMessageClick?: () => void;
    };
    const { name, unreadCount = 0, onMessageClick }: Props = $props();
</script>

<div class="w-full flex items-center gap-3 bg-zinc-200 rounded-lg p-3 text-left">
    <!-- Profile Pic -->
    <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
        <span class="text-white text-sm font-semibold">
            {name[0].toUpperCase()}
        </span>
    </div>
    <!-- Name -->
    <p class = "text-black font-medium truncate">
        {name}
    </p>
    <!-- Unread Count -->
    {#if unreadCount > 0}
        <div class="min-w-[22px] h-6 px-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
        </div>
    {/if}
    <div class = "ml-auto flex items-center gap-3">
        <!-- Chat Message Icon (for now) -->
        <button class = "p-2 hover:bg-zinc-300 rounded-full transition-colors cursor-pointer" onclick={onMessageClick}> 
            <MessageSquare size={18} />
        </button>

        <!-- Three Dots -->
        <button class = "p-2 hover:bg-zinc-300 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical size={18} />
        </button>
    </div>
</div>  