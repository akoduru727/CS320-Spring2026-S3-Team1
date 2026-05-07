import { redirect, fail } from "@sveltejs/kit";
import type {PageServerLoad, Actions} from "./$types";

export const load: PageServerLoad = async ({ locals }) =>{
    if (locals.accountType !== "landlord") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const userId = locals.user.id;
    
    //Fetching landlord's tenant contacts from supabase where id = userId
    const { data: landlordRow, error: landlordError } = await locals.supabase
        .from("landlords").select("contacts").eq("id", userId).single();

    if (landlordError) console.error("Error fetching landlord data:", landlordError);

    const contactIds = ((landlordRow?.contacts ?? []) as string[]).filter(Boolean); //Extracting ids: takes ids from contacts column and defaults to empty array if null, and removes any null/empty values

    const { data: contactRows } = await locals.supabase
        .from("tenants").select("id, name").in("id", contactIds); //selects ids and names from the list of tenant uuids

    const { data: conversations } = await locals.supabase
        .from("conversation").select("id, chat_participants, messages_id").contains("chat_participants", [userId]);
    
    const { data: messageRows } = await locals.supabase
        .from("message").select("id, created_at, sender, messages_content, conversation_id, is_read, read_at").in("conversation_id", conversations?.map(conv => conv.id) ?? []);
    return {
        contacts: contactRows ?? [],
        conversations: conversations ?? [],
        messages: messageRows ?? [],
        currentUserId: userId
    };
};

export const actions: Actions = {
    sendMessage: async ({ request, locals }) => {
        if (!locals.user) return fail(401, {message: "Unauthorized"});
        const formData = await request.formData();
        const conversationId = formData.get("conversationId") as string;
        const messageContent = formData.get("messageContent") as string;
        if (!conversationId || !messageContent) return fail(400, {message: "Missing conversation ID or message content"});
        const {error} = await locals.supabase
            .from("message").insert({ sender: locals.user.id, messages_content: messageContent.trim(), conversation_id: conversationId, is_read: false });
        if (error) return fail(500, {message: error.message});
        return {success: true};
    },
    loadMessage: async ({ request, locals }) => {
        if (!locals.user) return fail(401, {message: "Unauthorized"});
        const formData = await request.formData();
        const conversationId = formData.get("conversationId") as string;
        if (!conversationId) return fail(400, {message: "Missing conversation ID"});
        const {data, error} = await locals.supabase
            .from("message").select("*").eq("conversation_id", conversationId).order("created_at", {ascending: true});
        if (error) return fail(500, {message: error.message});
        return {json: JSON.stringify({messages: data ?? [], currentUserId: locals.user.id})};
    },
    markAsRead: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const conversationId = formData.get("conversationId") as string;
        if (!conversationId) return fail(400, { message: "Missing conversation ID" });
        const { error } = await locals.supabase
            .from("message").update({ is_read: true, read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("is_read", false).neq("sender", locals.user.id);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    blockTenant: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;

        //Removes and blocks on landlord's side
        const { data: landlordRow } = await locals.supabase
            .from("landlords").select("contacts, blocked_accounts").eq("id", locals.user.id).single();
        const updatedContacts = (landlordRow?.contacts ?? []).filter((id: string) => id !== contactId);
        const updatedBlocked = [...(landlordRow?.blocked_accounts ?? []), contactId];
        await locals.supabase
            .from("landlords").update({ contacts: updatedContacts, blocked_accounts: updatedBlocked }).eq("id", locals.user.id); 
        
        //Removes landlord from tenant's contacts too and adds to blocked list
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("landlord_contacts, blocked_landlords").eq("id", contactId).single();
        const updatedLandlordContacts = (tenantRow?.landlord_contacts ?? []).filter((id: string) => id !== locals.user!.id);
        const updatedBlockedLandlords = [...(tenantRow?.blocked_landlords ?? []), locals.user.id];
        const { error } = await locals.supabase
            .from("tenants").update({ landlord_contacts: updatedLandlordContacts, blocked_landlords: updatedBlockedLandlords }).eq("id", contactId);
         if (error) return fail(500, { message: error.message });
         return { success: true };
    }
}

