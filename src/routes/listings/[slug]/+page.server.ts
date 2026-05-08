import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getListingImages, type ListingImage } from "$lib/server/listing-images";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (locals.accountType !== "tenant") return redirect(303, "/");
  if (!locals.user) return redirect(303, "/login");

  const { data, error } = await locals.supabase
    .from("listings")
    .select()
    .eq("id", params.slug)
    .single();

  if (error) return redirect(303, "/");

  const { error: viewsError } = await locals.supabase
    .from("listings")
    .update({ views: data.views + 1 })
    .eq("id", data.id);

  if (viewsError) console.error(viewsError);

  const { data: tenantRow, error: tenantError } = await locals.supabase
    .from("tenants")
    .select("favorite_houses")
    .eq("id", locals.user.id)
    .single();
  if (tenantError) console.error(tenantError);
  const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];

  let listingImages: ListingImage[] = [];

  try {
    listingImages = await getListingImages(locals.supabase, params.slug);
  } catch (imagesError) {
    console.error(imagesError);
  }

  const { data: applications } = await locals.supabase
    .from("applications")
    .select("listing")
    .eq("tenant", locals.user.id);

  const hasApplied = (applications ?? []).some(
    (a) => a.listing === params.slug
  );

  return {
    listing: data,
    listingImages,
    isFavorite: favoriteIds.includes(params.slug),
    hasApplied,
  };
};

export const actions: Actions = {
  toggleFavorite: async ({ locals, params, url }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const { data: tenantRow, error: tenantError } = await locals.supabase
      .from("tenants")
      .select("favorite_houses")
      .eq("id", locals.user.id)
      .single();
    if (tenantError) {
      console.error(tenantError);
      return fail(500, { message: tenantError.message });
    }

    const listingId = params.slug;
    const favoriteIds = (tenantRow?.favorite_houses ?? []) as string[];
    const isCurrentlyFavorite = favoriteIds.includes(listingId);
    const nextFavorites = isCurrentlyFavorite
      ? favoriteIds.filter((id) => id !== listingId)
      : [...favoriteIds, listingId];

    const { data: updatedTenant, error: updateError } = await locals.supabase
      .from("tenants")
      .update({ favorite_houses: nextFavorites })
      .eq("id", locals.user.id)
      .select("favorite_houses")
      .single();
    if (updateError) {
      console.error(updateError);
      return fail(500, { message: updateError.message });
    }
    if (!updatedTenant) return fail(500, { message: "Favorite update failed (no row returned)." });

    return redirect(303, url.pathname);
  },
  contactLandlord: async ({ locals, params }) => {
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");
    const tenantId = locals.user.id;
    const listingId = params.slug;
    
    //Getting landlord id:
    const { data: listing, error: listingError } = await locals.supabase
      .from("listings").select("landlord").eq("id", listingId).single();
    if (listingError) {
      console.error(listingError);
      return fail(500, { message: listingError.message });
    }
    if (!listing) return fail(500, { message: "Listing not found" });
    if (!listing.landlord) return fail(500, { message: "Listing has no landlord associated" });
    const landlordId = listing.landlord;

    //Adds landlord to user tenant's landlord contacts
    const { data: tenantRow } = await locals.supabase
      .from("tenants").select("landlord_contacts").eq("id", tenantId).single();
    const updatedTenantContacts = [...new Set([...(tenantRow?.landlord_contacts ?? []), landlordId])];
    await locals.supabase
      .from("tenants").update({ landlord_contacts: updatedTenantContacts }).eq("id", tenantId);
    
    //Adds tenant to landlord's tenant contacts
    const { data: landlordRow } = await locals.supabase
      .from("landlords").select("contacts").eq("id", landlordId).single();
    const updatedContacts = [...new Set([...(landlordRow?.contacts ?? []), tenantId])];
    await locals.supabase
      .from("landlords").update({ contacts: updatedContacts }).eq("id", landlordId);

    //Check if conversation already exists between tenant and landlord, if not creates new one
    const { data: existingConversations } = await locals.supabase
      .from("conversation").select("id").contains("chat_participants", [tenantId, landlordId]).single();
    let conversationId = existingConversations?.id;
    if (!conversationId) {
      const { data: newConversation } = await locals.supabase
        .from("conversation").insert({ chat_participants: [tenantId, landlordId], messages_id: [] }).select("id").single();
      conversationId = newConversation?.id;
    }
    return redirect(303, `/renter-chatroom?contactId=${landlordId}`);
  }
};
