<script lang="ts">
    interface Props {
        senderName: string;
        text: string;
        user: "self" | "other";
        date: Date;
    };
    const { senderName, text, user, date}: Props = $props();
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
            <div>
                <p class= "text-base font-semibold text-black">{senderName}</p>
            </div>
            <p class="mt-1 rounded-xl border border-zinc-400 bg-white px-4 py-3 text-black break-words">{text}</p>
            <p class = "mt-1 text-sm text-zinc-500">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
            <div>
                <p class= "text-base font-semibold text-black">{senderName}</p>
            </div>
            <p class="mt-1 rounded-xl border border-zinc-400 bg-white px-4 py-3 text-black break-words">{text}</p>
            <p class = "mt-1 text-sm text-zinc-500">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
    </div>
{/if}