<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import { Trash2 } from "@lucide/svelte";

  const { data, form } = $props();
  const selectedListing = $derived(data.mode === "tenant" ? (data.selectedListing ?? null) : null);
  let showApplications = $state(true);

  const formatDate = (iso: string | null) => {
    if (!iso) return "Unknown date";
    const d = new Date(iso);
    return Number.isNaN(d.valueOf()) ? "Unknown date" : d.toLocaleString();
  };

  const statusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "bg-green-500/10 text-green-800 border-green-600/20";
    if (normalized === "rejected") return "bg-red-500/10 text-red-800 border-red-600/20";
    return "bg-zinc-500/10 text-zinc-800 border-zinc-600/20";
  };

  const flowStepClass = (status: string, step: "pending" | "approved" | "rejected") => {
    const normalized = status.toLowerCase();
    const active = normalized === step;
    if (!active) return "bg-zinc-200 text-zinc-700";
    if (step === "approved") return "bg-green-600/20 text-green-900";
    if (step === "rejected") return "bg-red-600/20 text-red-900";
    return "bg-zinc-900 text-zinc-100";
  };
</script>

<div class="flex-1 overflow-y-auto">
  <section class="mx-auto w-full max-w-5xl p-8 space-y-6">
    <div>
      <h1 class="text-3xl font-semibold tracking-tighter">Application Portal</h1>
      {#if data.mode === "tenant"}
        <p class="text-zinc-600">Track your rental applications and their status.</p>
      {:else}
        <p class="text-zinc-600">Review tenant applications for your listings.</p>
      {/if}
    </div>

    {#if data.message || form?.message}
      <Card class="border border-red-200 bg-red-50">
        <p class="text-sm text-red-800">{form?.message || data.message}</p>
      </Card>
    {/if}

    {#if data.mode === "tenant"}
      <Card class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold tracking-tight">Your applications</h2>
            <p class="text-sm text-zinc-600">Track application status changes here.</p>
          </div>
        </div>

        {#if selectedListing}
          <div class="rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-4">
            <h3 class="text-lg font-semibold tracking-tight">New application</h3>

            <form method="POST" action="?/submit" class="space-y-4">
              <div class="space-y-1">
                <p class="text-sm font-medium text-zinc-700">Listing</p>
                <p class="rounded-md border border-zinc-300 bg-zinc-200 px-3 py-2 text-sm">
                  {selectedListing.label}
                </p>
                <input type="hidden" name="listing_id" value={selectedListing.id} />
              </div>

              <label class="block">
                <p class="text-sm font-medium text-zinc-700">Message (optional)</p>
                <textarea
                  name="message"
                  rows={4}
                  class="mt-1 w-full rounded-md border border-zinc-300 bg-zinc-200 px-3 py-2 text-sm"
                  placeholder="Introduce yourself and include anything the landlord should know."
                  disabled={!data.dbReady}
                ></textarea>
              </label>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="rounded-md bg-red-800 hover:bg-red-700 transition-colors px-4 py-2 text-sm font-medium text-zinc-100"
                  disabled={!data.dbReady}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        {/if}

        {#if !data.dbReady}
          <p class="text-sm text-zinc-600">
            Application tracking is unavailable until the applications table exists.
          </p>
          {#if !selectedListing}
            <p class="text-sm text-zinc-600">
              To apply, open a listing from <a class="text-red-800 hover:text-red-700 underline" href="/search">Search</a>.
            </p>
          {/if}
        {:else if data.applications.length === 0}
          <p class="text-sm text-zinc-600">You have not submitted any applications yet.</p>
          {#if !selectedListing}
            <p class="text-sm text-zinc-600">
              To apply, open a listing from <a class="text-red-800 hover:text-red-700 underline" href="/search">Search</a>.
            </p>
          {/if}
        {:else}
          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-zinc-300"></div>
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Active applications</p>
            <div class="h-px flex-1 bg-zinc-300"></div>
            <button
              type="button"
              class="rounded-md border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 transition-colors px-3 py-1.5 text-sm font-medium"
              onclick={() => (showApplications = !showApplications)}
            >
              {showApplications ? "Hide" : "Show"}
            </button>
          </div>
          {#if !showApplications}
            <p class="text-sm text-zinc-600">Applications hidden.</p>
          {:else}
            <div class="space-y-3">
              {#each data.applications as app (app.id)}
                <div class="rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-3">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="font-medium">{app.listingLabel}</p>
                      <p class="text-xs text-zinc-600">{formatDate(app.createdAt)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(app.status)}`}>
                        {app.status}
                      </span>
                      <form
                        method="POST"
                        action="?/delete"
                        class="inline-flex"
                        onsubmit={(e) => {
                          if (!confirm("Are you sure you want to delete this application?")) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="application_id" value={app.id} />
                        <button
                          type="submit"
                          class="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                          disabled={!data.dbReady}
                          aria-label="Delete Application"
                          title="Delete Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 text-xs text-zinc-700">
                    <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "pending")}`}>Pending</span>
                    <span class="text-zinc-400">→</span>
                    <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "approved")}`}>Approved</span>
                    <span class="text-zinc-400">→</span>
                    <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "rejected")}`}>Rejected</span>
                  </div>

                  {#if app.message}
                    <p class="text-sm text-zinc-700 whitespace-pre-wrap">{app.message}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </Card>
    {:else}
      <Card class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Incoming applications</h2>

        {#if !data.dbReady}
          <p class="text-sm text-zinc-600">
            Application review is unavailable until the applications table exists.
          </p>
        {:else if data.applications.length === 0}
          <p class="text-sm text-zinc-600">No applications yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.applications as app (app.id)}
              <div class="rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-3">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <p class="font-medium">{app.listingLabel}</p>
                    <p class="text-sm text-zinc-700">From: {app.tenantLabel}</p>
                    <p class="text-xs text-zinc-600">{formatDate(app.createdAt)}</p>
                  </div>
                  <span class={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {#if app.message}
                  <p class="text-sm text-zinc-700 whitespace-pre-wrap">{app.message}</p>
                {/if}

                <div class="flex items-center gap-2 text-xs text-zinc-700">
                  <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "pending")}`}>Pending</span>
                  <span class="text-zinc-400">→</span>
                  <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "approved")}`}>Approved</span>
                  <span class="text-zinc-400">→</span>
                  <span class={`rounded-full px-2 py-1 ${flowStepClass(app.status, "rejected")}`}>Rejected</span>
                </div>

                {#if app.status.toLowerCase() === "pending"}
                  <form method="POST" action="?/setStatus" class="flex justify-end gap-2">
                    <input type="hidden" name="application_id" value={app.id} />
                    <button
                      type="submit"
                      name="status"
                      value="approved"
                      class="rounded-md bg-green-700 hover:bg-green-600 transition-colors px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="rejected"
                      class="rounded-md bg-red-800 hover:bg-red-700 transition-colors px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Reject
                    </button>
                  </form>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    {/if}
  </section>
</div>
