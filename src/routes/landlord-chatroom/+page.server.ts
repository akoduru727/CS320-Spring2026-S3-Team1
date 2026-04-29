import { redirect } from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";

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

