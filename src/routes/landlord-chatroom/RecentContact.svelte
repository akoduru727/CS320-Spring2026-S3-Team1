<script lang="ts">
    interface Props {
        name: string;
        onClick?: () => void;
    };
    const { name, onClick }: Props = $props();
</script>

<button class="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-zinc-300 active:scale-[0.98] active:bg-zinc-400 transition-all duration-100 cursor-pointer" onclick = {onClick}>
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
</button>