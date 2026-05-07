<script lang="ts">
    interface Props {
        senderName: string;
        text: string;
        user: "self" | "other";
        date: Date;
    };
    const { senderName, text, user, date}: Props = $props();
    function formatDate(d: Date): string {
        return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' 
        + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
</script>

{#if user === "other"}
    <!-- Left Side -->
    <div class = "w-full flex justify-start">
        <div class = "flex items-start gap-3 max-w-[70%]">
            <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
                <span class="text-white text-sm font-semibold">
                    {senderName[0].toUpperCase()}
                </span>
            </div>
            <div class="flex flex-col items-start">
                <div class="flex items-baseline gap-2 mb-1">
                    <p class= "text-base font-semibold text-black">{senderName}</p>
                    <p class="text-xs text-zinc-500">{formatDate(date)}</p>
                </div>
                <p class="rounded-2xl border border-zinc-400 bg-white px-3 py-2 text-black break-words">{text}</p>
            </div>
            
        </div>
    </div>
{:else if user === "self"}
    <!-- Right Side -->
    <div class = "w-full flex justify-end">
        <div class = "flex items-start gap-3 flex-row-reverse max-w-[70%]">
            <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
                <span class="text-white text-sm font-semibold">
                    Y
                </span>
            </div>
            <div class="flex flex-col items-end">
                <div class="flex items-baseline gap-2 mb-1">
                    <p class="text-xs text-zinc-500">{formatDate(date)}</p>
                    <p class= "text-base font-semibold text-black">{senderName}</p>
                </div>
                <p class="rounded-2xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-white break-words">{text}</p>
            </div>
        </div>
    </div>
{/if}