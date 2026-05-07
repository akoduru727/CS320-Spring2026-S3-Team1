<script lang="ts">
  interface Props {
    senderName: string;
    text: string;
    user: "self" | "other";
    date: Date;
  }
  const { senderName, text, user, date }: Props = $props();

  function formatDate(d: Date): string {
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' 
    + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
</script>

<div class="flex {user === 'self' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2">
  <!-- Avatar -->
  <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
    <span class="text-white text-sm font-semibold">
      {user === 'self' ? 'Y' : senderName[0].toUpperCase()}
    </span>
  </div>

  <!-- Bubble -->
  <div class="flex flex-col {user === 'self' ? 'items-end' : 'items-start'} max-w-[70%]">
    <div class="flex items-baseline gap-2 mb-1">
      {#if user === 'self'}
        <p class="text-xs text-zinc-500">{formatDate(date)}</p>
        <p class="text-base font-semibold text-black">{senderName}</p>
      {:else}
        <p class="text-base font-semibold text-black">{senderName}</p>
        <p class="text-xs text-zinc-500">{formatDate(date)}</p>
      {/if}
    </div>
    <p class="rounded-2xl border px-3 py-2 break-words {user === 'self' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-black border-zinc-400'}">{text}</p>
  </div>
</div>