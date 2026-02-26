<script lang="ts">
  import Card from "$lib/components/Card.svelte";
</script>

<div class="flex-1 flex justify-center items-center">
  <Card class="min-w-lg p-12 space-y-6">
    <p class="text-center tracking-tighter text-2xl font-medium">
      Sign in with SSO
    </p> 

    <div class="space-y-0.5">
      <p>
        Email
      </p>
      <input 
        class="w-full p-2 rounded-xl border border-zinc-300" 
        type="email"
      />
    </div>

    <div class="space-y-0.5">
      <p>
        Password
      </p>
      <input 
        class="w-full p-2 rounded-xl border border-zinc-300" 
        type="password"
      />
    </div>

    <a 
      class="block mx-auto p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-100 tracking-tight font-semibold text-center" 
      href="/profile"
    >
      Sign In
    </a>
  </Card> 
</div>
