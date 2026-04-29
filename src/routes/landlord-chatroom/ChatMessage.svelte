<script lang="ts">
  interface Props {
    senderName: string;
    text: string;
    user: "self" | "other";
    date: Date;
  }
  const { senderName, text, user, date }: Props = $props();

  function formatTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
    <p class="text-xs text-zinc-500 mb-1">{senderName}</p>
    <div class="rounded-2xl px-4 py-2 {user === 'self' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900'}">
      <p class="text-sm">{text}</p>
    </div>
    <p class="text-xs text-zinc-400 mt-1">{formatTime(date)}</p>
  </div>
</div>