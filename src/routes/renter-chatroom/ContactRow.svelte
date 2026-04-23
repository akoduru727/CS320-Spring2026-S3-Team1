<script lang="ts">
    import {MessageSquare, EllipsisVertical, Trash2, Check} from "@lucide/svelte";
    interface Props {
        name: string;
        image?: string;
        type?: "friend" | "landlord" | "requests";
        onMessageClick?: () => void;
        onReport?: () => void;
        onDelete?: () => void;
        onAccept?: () => void;
        onReject?: () => void;
    };

    const { name, image, type = "friend", onMessageClick, onReport, onDelete, onAccept, onReject }: Props = $props();

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
        <div class="relative" role="menu" tabindex="-1" onmouseleave={startClose} onmouseenter={cancelClose}>

            <button class = "p-2 hover:bg-zinc-300 rounded-full transition-colors cursor-pointer" onclick={toggleMenu}>
                <EllipsisVertical size={18} />
            </button>

            {#if menuOpen}
                <div class="absolute right-0 top-9 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 w-40">
                    <!-- Friend List -->
                    {#if type === "friend"}
                        <button
                            class="w-full text-left px-4 py-2 text-sm text-black-500 hover:bg-zinc-100 transition-colors"
                            onclick={() => { onDelete?.(); menuOpen = false; }}
                        >
                            Remove Friend
                        </button>
                        <button
                            class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 transition-colors"
                            onclick={() => { onReport?.(); menuOpen = false; }}
                        >
                            Report
                        </button>
                    <!-- Landlord List -->
                    {:else if type === "landlord"}
                        <button
                            class="w-full text-left px-4 py-2 text-sm text-black-500 hover:bg-zinc-100 transition-colors"
                            onclick={() => { onDelete?.(); menuOpen = false; }}
                        >
                            Remove Landlord
                        </button>

                        <button
                            class="w-full text-left px-4 py-2 text-sm text-black-500 hover:bg-zinc-100 transition-colors"
                            onclick={() => { onReport?.(); menuOpen = false; }}
                        >
                            Block
                        </button>

                        <button
                            class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 transition-colors"
                            onclick={() => { onReport?.(); menuOpen = false; }}
                        >
                            Report
                        </button>
                    <!-- Request List -->
                    {:else if type === "requests"}
                        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-zinc-100 transition-colors"
                        onclick={() => { onAccept?.(); menuOpen = false; }}>
                            <Check size={16} />
                            Accept
                        </button>
                        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 transition-colors"
                        onclick={() => { onReject?.(); menuOpen = false; }}>
                            <Trash2 size={16} />
                            Reject
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>  