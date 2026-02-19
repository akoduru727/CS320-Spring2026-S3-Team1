<script lang="ts">
  const onSignIn = () => {
    // TODO
  };
</script>

<main class="relative min-h-svh bg-zinc-100 flex flex-col">
  <nav class="flex shadow">
    <a href="/" class="p-4">
      <span class="tracking-tighter text-3xl font-bold text-rose-500 select-none">
        uhc(t)
      </span> 
    </a>
  </nav>
  <div class="flex-1 flex justify-center items-center">
    <div class="min-w-lg p-12 border border-zinc-400 rounded-xl space-y-6">
      <p class="text-center tracking-tight text-2xl font-bold">
        Sign in with SSO
      </p> 
      <input 
        class="w-full p-2 rounded-xl border border-zinc-400" 
        placeholder="UMass email" 
      />
      <button 
        class="w-full p-2 rounded-xl bg-rose-500 hover:bg-rose-600 transition-colors text-zinc-100 font-bold text-center cursor-pointer" 
        onclick={onSignIn}
      >
        Sign in
      </button>
    </div> 
  </div>
</main>
