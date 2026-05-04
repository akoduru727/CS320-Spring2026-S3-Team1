<script lang="ts">
  import Card from "$lib/components/Card.svelte";

  const { data, form } = $props();

  const tenantListings = $derived(data.mode === "tenant" ? (data.listings ?? []) : []);
  let selectedListingId = $state(data.mode === "tenant" ? (data.selectedListingId ?? "") : "");
  let showNewApplication = $state(false);
  if (selectedListingId) showNewApplication = true;

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

  const listingLabelById = $derived(
    new Map<string, string>(tenantListings.map((l: { id: string; label: string }) => [l.id, l.label]))
  );
  const selectedListingLabel = $derived(selectedListingId ? listingLabelById.get(selectedListingId) ?? null : null);
</script>

<div class="flex-1 overflow-y-auto">
  <section class="mx-auto w-full max-w-5xl p-8 space-y-6">
    <div>
      <h1 class="text-3xl font-semibold tracking-tighter">Application Portal</h1>
      {#if data.mode === "tenant"}
        <p class="text-zinc-600">Submit rental applications and track their status.</p>
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
          <button
            type="button"
            class="rounded-md border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 transition-colors px-3 py-1.5 text-sm font-medium"
            onclick={() => (showNewApplication = !showNewApplication)}
            disabled={!data.dbReady}
          >
            {showNewApplication ? "Hide form" : "New application"}
          </button>
        </div>

        {#if !data.dbReady}
          <p class="text-sm text-zinc-600">
            Application tracking is unavailable until the applications table exists.
          </p>
        {:else if data.applications.length === 0}
          <p class="text-sm text-zinc-600">You have not submitted any applications yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.applications as app (app.id)}
              <div class="rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-3">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-medium">{app.listingLabel}</p>
                    <p class="text-xs text-zinc-600">{formatDate(app.createdAt)}</p>
                  </div>
                  <span class={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(app.status)}`}>
                    {app.status}
                  </span>
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

                <!-- LANDLORD INFO -->
                {#if app.application_type === "contact"}
                  <div class="text-sm text-zinc-700">
                    <p><strong>Email:</strong> {app.contact_email}</p>

                    {#if app.contact_phone}
                      <p><strong>Phone:</strong> {app.contact_phone}</p>
                    {/if}
                  </div>
                {/if}

                {#if app.application_type === "pdf"}
                  <a
                    href={app.application_pdf_url}
                    target="_blank"
                    class="text-red-600 hover:underline text-sm"
                  > 
                    View Application PDF
                  </a>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </Card>

      {#if showNewApplication}
        <Card class="space-y-4">
          <h2 class="text-xl font-semibold tracking-tight">New application</h2>

          <form method="POST" action="?/submit" class="space-y-4">
            {#if selectedListingLabel}
              <div class="space-y-1">
                <p class="text-sm font-medium text-zinc-700">Listing</p>
                <p class="rounded-md border border-zinc-300 bg-zinc-200 px-3 py-2 text-sm">
                  {selectedListingLabel}
                </p>
                <input type="hidden" name="listing_id" value={selectedListingId} />
              </div>
            {:else}
              <label class="block">
                <p class="text-sm font-medium text-zinc-700">Listing</p>
                <select
                  bind:value={selectedListingId}
                  name="listing_id"
                  class="mt-1 w-full rounded-md border border-zinc-300 bg-zinc-200 px-3 py-2 text-sm"
                  required
                  disabled={!data.dbReady}
                >
                  <option value="" selected disabled>Select a listing…</option>
                  {#each tenantListings as listing (listing.id)}
                    <option value={listing.id}>{listing.label}</option>
                  {/each}
                </select>
              </label>
            {/if}

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
                disabled={!data.dbReady || tenantListings.length === 0 || !selectedListingId}
              >
                Submit application
              </button>
            </div>
          </form>

          {#if tenantListings.length === 0}
            <p class="text-sm text-zinc-600">No listings available to apply to yet.</p>
          {/if}
        </Card>
      {/if}
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
