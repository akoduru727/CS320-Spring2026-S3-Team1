import { redirect } from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import { landlordContacts } from "./tempdata";

export const load: PageServerLoad = async ({locals}) =>{
    if (locals.accountType !== "tenant") return redirect(303, "/");
    if (!locals.user) return redirect(303, "/login");

    const userId = locals.user.id;

    //Fetching tenants's friends and landlord contacts from supabase where id = userId
    const { data: tenantRow, error: tenantError } = await locals.supabase
        .from("tenants").select("friends, landlord_contacts").eq("id", userId).single();
    
    if (tenantError) console.error("Error fetching tenant data:", tenantError);

    const friendsIds = ((tenantRow?.friends ?? []) as string[]).filter(Boolean); //Extractig ids: takes ids from friends column and defaults to empty array if null, and removes any null/empty values
    const landlordIds = ((tenantRow?.landlord_contacts ?? []) as string[]).filter(Boolean);

    //Friends Contact Details
    const { data: friendsData, error: friendsError } = await locals.supabase
        .from("tenants").select("id, name").in("id", friendsIds); //selects ids and names from the list of friend uuids 
    
    //Landlord Contact Details
    const { data: landlordData, error: landlordError } = await locals.supabase
        .from("landlords").select("id, name").in("id", landlordIds);
    
    //Message Request 
    const { data: requestData, error: requestError } = await locals.supabase
        .from("chat_splash").select("id, user_id, message_request, status").eq("conversations_id", userId).eq("status", "pending");

    return {
        friendContacts: friendRows ?? [], landlordContacts: landlordRows ?? [], requestContacts: requestRows ?? []
    };
};
