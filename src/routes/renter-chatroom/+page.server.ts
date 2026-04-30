import { redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals}) =>{
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const userId = locals.user.id;

    //Fetching tenants's friends and landlord contacts from supabase where id = userId
    const { data: tenantRow, error: tenantError } = await locals.supabase
        .from("tenants").select("friends, landlord_contacts, roommate_group_id").eq("id", userId).single();
    
    if (tenantError) console.error("Error fetching tenant data:", tenantError);

    const friendsIds = ((tenantRow?.friends ?? []) as string[]).filter(Boolean); //Extractig ids: takes ids from friends column and defaults to empty array if null, and removes any null/empty values
    const landlordIds = ((tenantRow?.landlord_contacts ?? []) as string[]).filter(Boolean);
    const roommateGroupId = tenantRow?.roommate_group_id ?? null;

    //Friends Contact Details
    const { data: friendRows } = await locals.supabase
        .from("tenants").select("id, name").in("id", friendsIds); //selects ids and names from the list of friend uuids 
    
    //Landlord Contact Details
    const { data: landlordRow, error: landlordError } = await locals.supabase
        .from("landlords").select("id, name").in("id", landlordIds);
    console.log("landlordIds:", landlordIds);
    console.log("landlordRow:", landlordRow);
    console.log("landlordError:", landlordError);
    
    //Message Request 
    const { data: requestRow } = await locals.supabase
        .from("chat_splash").select("id, user_id, message_request, status").eq("conversations_id", userId).eq("status", "pending");

    //Roommate Group Members (if exists)
    const { data: roommateGroup } = await locals.supabase
        .from("tenants").select("id, name").eq("roommate_group_id", roommateGroupId ?? "").neq("id", userId);
    
    let roommateConversationId: string | null = null;
    if(roommateGroup && roommateGroup.length > 0){
        const allMembersIds = [userId, ...roommateGroup.map((member: {id: string}) => member.id)];
        const { data: existingConversations } = await locals.supabase
            .from("conversation").select("id, chat_participants").contains("chat_participants", allMembersIds).single();
        if (existingConversations) roommateConversationId = existingConversations.id;
        else{
            const { data: newConversation} = await locals.supabase
                .from("conversation").insert({chat_participants: allMembersIds, messages_id: []}).select("id").single();
            roommateConversationId = newConversation?.id ?? null;
        }
    }
    const { data: friendConversations } = await locals.supabase
        .from("conversation").select("id, chat_participants, messages_id").contains("chat_participants", [userId]).in("chat_participants", friendsIds);
    
    const { data: landlordConversations } = await locals.supabase
        .from("conversation").select("id, chat_participants, messages_id").contains("chat_participants", [userId]).in("chat_participants", landlordIds);
    
    const { data: friendMessages } = await locals.supabase
        .from("message").select("id, created_at, sender, messages_content, conversation_id, is_read, read_at").in("conversation_id", friendConversations?.map(convo => convo.id) ?? []);
    
    const { data: landlordMessages } = await locals.supabase
        .from("message").select("id, created_at, sender, messages_content, conversation_id, is_read, read_at").in("conversation_id", landlordConversations?.map(convo => convo.id) ?? []);
    
    return {
        friendContacts: friendRows ?? [], landlordContacts: landlordRow ?? [], requestContacts: requestRow ?? [],
        conversations: [...(friendConversations ?? []), ...(landlordConversations ?? [])], 
        messages: [...(friendMessages ?? []), ...(landlordMessages ?? [])], roommateGroup: roommateGroup ?? [], 
        roommateConversationId, currentUserId: userId
    };
};

export const actions: Actions = {
    createConversation: async ({ request, locals }) => {
        if (!locals.user) return fail(401, {message: "Unauthorized"});
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;
        if (!contactId) return fail(400, {message: "Missing Contact ID"}); 
        const {data: existingConversations} = await locals.supabase
            .from("conversation").select("id").contains("chat_participants", [locals.user.id, contactId]).single()
        if (existingConversations) return {conversationId: existingConversations.id}

        //Creating New Conversation:
        const {data: newConversation, error} = await locals.supabase
            .from("conversation").insert({ chat_participants: [locals.user.id, contactId] as string[], messages_id: [] }).select("id").single();
        
        if (error) return fail(500, {message: error.message});
        return {conversationId: newConversation.id};
    },
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
    }
}
