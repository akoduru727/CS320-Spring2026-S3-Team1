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
        .from("chat_splash").select("id, user_id, message_request, status").eq("conversations_id", userId).eq("status", "Pending");
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestSenderIds = ((requestRow ?? []) as any[]).map(req => req.user_id).filter(Boolean);
    const { data: requestSenderRows } = await locals.supabase
        .from("tenants").select("id, name").in("id", requestSenderIds);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestContactsData = ((requestRow ?? []) as any[]).map(req => ({
        id: req.user_id,
        name: (requestSenderRows ?? []).find((sender: any) => sender.id === req.user_id)?.name ?? "Unknown",
        requestId: req.id
    }));

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
        .from("conversation").select("id, chat_participants, messages_id").contains("chat_participants", [userId]);
    
    const { data: landlordConversations } = await locals.supabase
        .from("conversation").select("id, chat_participants, messages_id").contains("chat_participants", [userId]);
    
    const { data: friendMessages } = await locals.supabase
        .from("message").select("id, created_at, sender, messages_content, conversation_id, is_read, read_at").in("conversation_id", friendConversations?.map(convo => convo.id) ?? []);
    
    const { data: landlordMessages } = await locals.supabase
        .from("message").select("id, created_at, sender, messages_content, conversation_id, is_read, read_at").in("conversation_id", landlordConversations?.map(convo => convo.id) ?? []);
    
    return {
        friendContacts: friendRows ?? [], landlordContacts: landlordRow ?? [], requestContacts:  requestContactsData ?? [],
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

        //Check if user has blocked other:
        const { data: currentTenant } = await locals.supabase
            .from("tenants").select("blocked_friends, blocked_landlords").eq("id", locals.user.id).single();
        const isBlockedByMe = (currentTenant?.blocked_friends ?? []).includes(contactId) || (currentTenant?.blocked_landlords ?? []).includes(contactId);
        
        //Check if contact has blocked current user:
        const { data: otherTenant } = await locals.supabase
            .from("tenants").select("blocked_friends").eq("id", contactId).single();
        const { data: otherLandlord } = await locals.supabase
            .from("landlords").select("blocked_accounts").eq("id", contactId).single();
        const isBlockedByThem = (otherTenant?.blocked_friends ?? []).includes(locals.user.id) || (otherLandlord?.blocked_accounts ?? []).includes(locals.user.id);
        if (isBlockedByMe || isBlockedByThem) return fail(403, {message: "Cannot start conversation with this user"});
        
        const { data: deniedRequest } = await locals.supabase
            .from("chat_splash").select("id").eq("user_id", contactId).eq("conversations_id", locals.user.id).eq("status", "Denied").single();
        if (deniedRequest) return fail(403, {message: "Your previous message request was denied by this user. You cannot start a conversation."});

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
    },
    markAsRead: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const conversationId = formData.get("conversationId") as string;
        if (!conversationId) return fail(400, {message: "Missing conversation ID"});
        const { error } = await locals.supabase
            .from("message").update({ is_read: true, read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("is_read", false).neq("sender", locals.user.id);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    removeFriend: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;
        //Remove from current user's friend list
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("friends").eq("id", locals.user.id).single();
        const updatedFriends = (tenantRow?.friends ?? []).filter((id: string) => id !== contactId);
        await locals.supabase
            .from("tenants").update({ friends: updatedFriends }).eq("id", locals.user.id);
        
        //Removes current user from the other tenant's friends too
        const { data: otherTenantRow } = await locals.supabase
            .from("tenants").select("friends").eq("id", contactId).single();
        const otherUpdatedFriends = (otherTenantRow?.friends ?? []).filter((id: string) => id !== locals.user!.id);
        const { error } = await locals.supabase
            .from("tenants").update({ friends: otherUpdatedFriends }).eq("id", contactId);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    removeLandlord: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;
        //Removes landlord from tenant's landlord contacts
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("landlord_contacts").eq("id", locals.user.id).single();
        const updatedLandlordContacts = (tenantRow?.landlord_contacts ?? []).filter((id: string) => id !== contactId);
        await locals.supabase
            .from("tenants").update({ landlord_contacts: updatedLandlordContacts }).eq("id", locals.user.id);
        
        //Removes tenant from landlord's contacts too
        const { data: landlordRow } = await locals.supabase
            .from("landlords").select("contacts").eq("id", contactId).single();
        const otherUpdatedContacts = (landlordRow?.contacts ?? []).filter((id: string) => id !== locals.user!.id);
        const { error } = await locals.supabase
            .from("landlords").update({ contacts: otherUpdatedContacts }).eq("id", contactId);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    blockFriend: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;

        //Removes and blocks on current user's side
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("friends, blocked_friends").eq("id", locals.user.id).single();
        const updatedFriends = (tenantRow?.friends ?? []).filter((id: string) => id !== contactId);
        const updatedBlockedFriends = [...(tenantRow?.blocked_friends ?? []), contactId];
        await locals.supabase
            .from("tenants").update({ friends: updatedFriends, blocked_friends: updatedBlockedFriends }).eq("id", locals.user.id);
        
        //Removes current user from the other tenant's friends too
        const { data: otherTenantRow } = await locals.supabase
            .from("tenants").select("friends").eq("id", contactId).single();
        const otherUpdatedFriends = (otherTenantRow?.friends ?? []).filter((id: string) => id !== locals.user!.id);
        const { error } = await locals.supabase
            .from("tenants").update({ friends: otherUpdatedFriends }).eq("id", contactId);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    blockLandlord: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const contactId = formData.get("contactId") as string;
        //Removes and blocks on tenant's side
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("landlord_contacts, blocked_landlords").eq("id", locals.user.id).single();
        const updatedLandlordContacts = (tenantRow?.landlord_contacts ?? []).filter((id: string) => id !== contactId);
        const updatedBlockedLandlords = [...(tenantRow?.blocked_landlords ?? []), contactId];
        await locals.supabase
            .from("tenants").update({ landlord_contacts: updatedLandlordContacts, blocked_landlords: updatedBlockedLandlords }).eq("id", locals.user.id);
        
        //Removes tenant from landlord's contacts too and adds to blocked list
        const { data: landlordRow } = await locals.supabase
            .from("landlords").select("contacts, blocked_accounts").eq("id", contactId).single();
        const otherUpdatedContacts = (landlordRow?.contacts ?? []).filter((id: string) => id !== locals.user!.id);
        const otherUpdatedBlockedTenants = [...(landlordRow?.blocked_accounts ?? []), locals.user.id];
        const { error } = await locals.supabase
            .from("landlords").update({ contacts: otherUpdatedContacts, blocked_accounts: otherUpdatedBlockedTenants }).eq("id", contactId);
        if (error) return fail(500, { message: error.message });
        return { success: true };
    },
    acceptRequest: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const requestId = formData.get("requestId") as string;
        const senderId = formData.get("senderId") as string;

        //Updating chat_splash status to Approved
        const { error } = await locals.supabase
            .from("chat_splash").update({ status: "Approved" }).eq("id", requestId);
        if (error) return fail(500, { message: error.message });

        //Adding sender to current user's friends
        const { data: tenantRow } = await locals.supabase
            .from("tenants").select("friends").eq("id", locals.user.id).single();
        const updatedFriends = [...new Set(tenantRow?.friends ?? []), senderId];
        await locals.supabase
            .from("tenants").update({ friends: updatedFriends }).eq("id", locals.user.id);

        //Adding current user to sender's friends
        const { data: senderRow } = await locals.supabase
            .from("tenants").select("friends").eq("id", senderId).single();
        const updatedSenderFriends = [...new Set(senderRow?.friends ?? []), locals.user.id];
        const { error: updateError } = await locals.supabase
            .from("tenants").update({ friends: updatedSenderFriends }).eq("id", senderId);
        if (updateError) return fail(500, { message: updateError.message });
        return { success: true };
    },
    rejectRequest: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: "Unauthorized" });
        const formData = await request.formData();
        const requestId = formData.get("requestId") as string;

        //Update the chat_splash table to mark the request as denied
        const { error: DeniedError } = await locals.supabase
            .from("chat_splash").update({ status: "Denied" }).eq("id", requestId);
        if (DeniedError) return fail(500, { message: DeniedError.message });
        return { success: true };
    }
}
