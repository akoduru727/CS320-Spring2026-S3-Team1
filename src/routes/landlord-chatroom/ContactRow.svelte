<script lang="ts">
    import {MessageSquare, EllipsisVertical} from "@lucide/svelte";
    interface Props {
        name: string;
        image?: string;
        onMessageClick?: () => void;
    };
    const { name, image, onMessageClick }: Props = $props();
</script>

<div class="w-full flex items-center gap-3 bg-zinc-200 rounded-lg p-3 text-left">
    <!-- Profile Pic -->
    {#if image}
        <img src={image} alt="Profile Picture" class="w-8 h-8 rounded-full object-cover shrink-0"/>
    {:else}
         <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0"></div>
    {/if}
    <!-- Name -->
    <p class = "text-black font-medium truncate">
        {name}
    </p>
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