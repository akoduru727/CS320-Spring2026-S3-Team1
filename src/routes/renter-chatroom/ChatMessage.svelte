<script lang="ts">
    interface Props {
        senderName: string;
        profilePic?: string;
        text: string;
        user: "self" | "other";
        date: Date;
    };
    const { senderName, profilePic, text, user, date}: Props = $props();
</script>

{#if user === "other"}
    <!-- Left Side -->
    <div class = "w-full flex justify-start">
        <div class = "items-start gap-3 max-w-[70%]">
            {#if profilePic}
                <img src={profilePic} alt="Profile Picture" class="w-8 h-8 rounded-full object-cover shrink-0"/>
            {:else}
                <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0"></div>
            {/if}
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
            {#if profilePic}
                <img src={profilePic} alt="Profile Picture" class="w-8 h-8 rounded-full object-cover shrink-0"/>
            {:else}
                <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0"></div>
            {/if}
            <div>
                <p class= "text-base font-semibold text-black">{senderName}</p>
            </div>
            <p class="mt-1 rounded-xl border border-zinc-400 bg-white px-4 py-3 text-black break-words">{text}</p>
            <p class = "mt-1 text-sm text-zinc-500">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
    </div>
{/if}