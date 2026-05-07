<script lang="ts">
    import {MessageSquare, EllipsisVertical} from "@lucide/svelte";
    interface Props {
        name: string;
        unreadCount?: number;
        onMessageClick?: () => void;
        onBlock(): void;
    };
    const { name, unreadCount = 0, onMessageClick, onBlock }: Props = $props();

    let menuOpen = $state(false);

    function toggleMenu(e: MouseEvent) {
        e.stopPropagation();
        menuOpen = !menuOpen;
    }

    function handleClickOutside() {
        menuOpen = false;
    }

    //delay for report and remove contacts menu button

    let closeTimer: ReturnType<typeof setTimeout>;

    function startClose() {
        closeTimer = setTimeout(() => menuOpen = false, 150);
    }

    function cancelClose() {
        clearTimeout(closeTimer);
    }
</script>

<svelte:window onclick={handleClickOutside} />

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
        <div class="relative" role="menu" tabindex="-1" onmouseleave={startClose} onmouseenter={cancelClose}>
            <button class = "p-2 hover:bg-zinc-300 rounded-full transition-colors cursor-pointer" onclick={toggleMenu}>
                <EllipsisVertical size={18} />
            </button>
            {#if menuOpen}
                <div class="absolute right-0 top-9 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 w-36">
                    <button class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 transition-colors" onclick={() => {onBlock?.(); menuOpen = false;}}>
                        Block
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>  