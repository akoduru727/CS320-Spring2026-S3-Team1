<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import SidebarButton from "./SidebarButton.svelte";
  import RecentContact from "./RecentContact.svelte";
  import ContactRow from "./ContactRow.svelte";
  import ChatPage from "./ChatPage.svelte";
  //import {recentContacts, friendContacts as initialFriendContacts, landlordContacts, requestContacts as initialRequestContacts, type Tab} from "./tempdata";
  import {Users, House, Mail} from "@lucide/svelte";
  import {onMount} from "svelte";
  import { totalUnreadCount } from "$lib/components/unreadStore";
  type Contact = {id: string, name: string, pinned?: boolean};
  type Tab = "friends" | "landlords" | "requests";
  export let data:{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any;
    friendContacts: Contact[];
    landlordContacts: Contact[];
    requestContacts: Contact[];
    conversations: {id: string, chat_participants: string[], messages_id: string[]}[];
    messages: {id: string, created_at: string, sender: string, messages_content: string, conversation_id: string, is_read: boolean, read_at: string | null}[];
    roommateGroup: Contact[];
    roommateConversationId: string | null;
    currentUserId: string;
  }; //from +page.server.ts
  
  let selectedTab: Tab = "friends";
  let selectedContact: Contact | null = null;
  let selectedConversationId: string | null = null;
  let search = "";

  let friendContacts: Contact[] = data.friendContacts;
  let landlordContacts: Contact[] = data.landlordContacts;
  let requestContacts: Contact[] = data.requestContacts;
  let conversations = data.conversations;
  let messages = data.messages;
  let roommateGroup: Contact[] = data.roommateGroup;
  $: shownContacts = (selectedTab === "friends" ? friendContacts : selectedTab === "landlords" ? landlordContacts : requestContacts) as Contact[];
  $: filteredContacts = shownContacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()));
  $: recentContacts = [...(roommateGroup.length > 0 ? [{id: "roommate-group", name: "Roommate Group", pinned: true, conversationId: data.roommateConversationId}] : []), 
    ...[...friendContacts, ...landlordContacts]
    .filter(contact => conversations.some(c => (c.chat_participants as string[]).includes(contact.id)))
    .sort((a,b) => {
        const aConvo = conversations.find(c => (c.chat_participants as string[]).includes(a.id));
        const bConvo = conversations.find(c => (c.chat_participants as string[]).includes(b.id));
        const aLastMsg = messages.filter(m => m.conversation_id === aConvo?.id).at(-1)?.created_at ?? "";
        const bLastMsg = messages.filter(m => m.conversation_id === bConvo?.id).at(-1)?.created_at ?? "";
        return bLastMsg.localeCompare(aLastMsg);
    })];
  $: unreadCountPerContact = Object.fromEntries([...friendContacts, ...landlordContacts].map(contact => {
    const convo = conversations.find(c => (c.chat_participants as string[]).includes(contact.id));
    const unreadCount = convo ? messages.filter(m => m.conversation_id === convo.id && !m.is_read && m.sender !== data.currentUserId).length : 0;
    return [contact.id, unreadCount];
  }))
  $: friendTotalUnread = friendContacts.reduce((sum, c) => sum + (unreadCountPerContact[c.id] ?? 0), 0);
  $: landlordTotalUnread = landlordContacts.reduce((sum, c) => sum + (unreadCountPerContact[c.id] ?? 0), 0);
  $: requestTotalUnread = requestContacts.length;
  $: totalUnreadCount.set(friendTotalUnread + landlordTotalUnread + requestTotalUnread);
  async function openChat(contact: Contact & {conversationId?: string | null}){
    console.log("openChat called for:", contact.name);
    selectedContact = contact;
    if (contact.conversationId) {
        selectedConversationId = contact.conversationId;
        console.log("Using existing conversationId:", contact.conversationId);
        //return;
    }
    else{
        const existingConversation = conversations.find(convo => (convo.chat_participants as string[]).includes(contact.id));
        console.log("Existing conversation:", existingConversation);
        if (existingConversation){
            selectedConversationId = existingConversation.id;
            console.log("Found existing conversation:", existingConversation.id);
            //return;
        }
        else{
            //Form Action to create new conversation if one doesn't exist
            console.log("Fetching createConversation action...");
            const formData = new FormData();
            formData.append("contactId", contact.id);
            const response = await fetch("?/createConversation", { method: "POST", body: formData, credentials: "include" });
            const result = await response.json();
            console.log("Result:", result);
            
            //Parsing the data string
            const parsedData = JSON.parse(result.data);
            const conversationId = parsedData[1];
        
            if (conversationId){
                console.log("Creating new conversation...");
                selectedConversationId = conversationId;
                conversations = [...conversations, {
                    id: conversationId, chat_participants: [data.currentUserId, contact.id], messages_id: [] }];
            }
        }
    }
    if (selectedConversationId){
        const formData = new FormData();
        formData.append("conversationId", selectedConversationId);
        const markResponse = await fetch("?/markAsRead", { method: "POST", body: formData, credentials: "include" });
        const markResult = await markResponse.json();
        console.log("markAsRead result:", markResult);
        messages = messages.map(m => 
            (m.conversation_id === selectedConversationId && m.sender !== data.currentUserId) ? {...m, is_read: true} : m
        );
    }
  }
  function closeChat(){
    selectedContact = null;
    selectedConversationId = null;
  }
  async function removeFriend(contact: Contact){
    console.log("Removing friend", contact.name);
    const formData = new FormData();
    formData.append("contactId", contact.id);
    await fetch("?/removeFriend", { method: "POST", body: formData, credentials: "include" });
    friendContacts = friendContacts.filter(c => c.id !== contact.id);
  }
  async function removeLandlord(contact: Contact){
    console.log("Removing landlord", contact.name);
    const formData = new FormData();
    formData.append("contactId", contact.id);
    await fetch("?/removeLandlord", { method: "POST", body: formData, credentials: "include" });
    landlordContacts = landlordContacts.filter(c => c.id !== contact.id);
  }
  async function blockFriend(contact: Contact){
    console.log("Blocking friend", contact.name);
    const formData = new FormData();
    formData.append("contactId", contact.id);
    await fetch("?/blockFriend", { method: "POST", body: formData, credentials: "include" });
    friendContacts = friendContacts.filter(c => c.id !== contact.id);
  }
  async function blockLandlord(contact: Contact){
    console.log("Blocking friend", contact.name);
    const formData = new FormData();
    formData.append("contactId", contact.id);
    await fetch("?/blockLandlord", { method: "POST", body: formData, credentials: "include" });
    landlordContacts = landlordContacts.filter(c => c.id !== contact.id);
  }
  function acceptRequest(contact: Contact){
    console.log("Accepting request from", contact.name);
    requestContacts = requestContacts.filter(c => c.id !== contact.id);
    friendContacts = [...friendContacts, contact];
  }
  function rejectRequest(contact: Contact){
    console.log("Rejecting request from", contact.name);
    requestContacts = requestContacts.filter(c => c.id !== contact.id);
  }
  onMount(() => {
    const channel = data.supabase.channel("new-messages").on("postgres_changes",{event: "INSERT", schema: "public", table: "message"}, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
            const newMessage = payload.new as typeof messages[0];
            const isRelevant = conversations.some(c => c.id === newMessage.conversation_id);
            if (isRelevant){
                //If chat is open:
                if (newMessage.conversation_id === selectedConversationId && newMessage.sender !== data.currentUserId) {
                    newMessage.is_read = true;
                    const formData = new FormData();
                    formData.append("conversationId", newMessage.conversation_id);
                    fetch("?/markAsRead", { method: "POST", body: formData, credentials: "include" });
                }
                messages = [...messages, newMessage];
            }
        }
    ).subscribe();
    return () => data.supabase.removeChannel(channel);
  });
</script>

<div class = "flex-1 flex overflow-hidden">
    <section class ="p-8 flex flex-col flex-1 min-h-0">
        <Card class = "flex-1 min-h-0 p-0 overflow-hidden">
            <div class = "flex h-full">
                <!--Left Sidebar-->
                <div class = "w-72 bg-zinc-400 p-4 flex flex-col">
                    <div class = "space-y-3">
                    <SidebarButton text="Friends" icon= {Users} active = {selectedTab === "friends"} onClick={() => {selectedTab = "friends"; selectedContact = null;}} count={friendTotalUnread}/>
                    <SidebarButton text="Landlords" icon= {House} active = {selectedTab === "landlords"} onClick={() => {selectedTab = "landlords"; selectedContact = null;}} count={landlordTotalUnread}/>
                    <SidebarButton text="Message Requests" icon= {Mail} active = {selectedTab === "requests"} onClick={() => {selectedTab = "requests"; selectedContact = null;}} count = {requestTotalUnread}/>
                    </div>

                    <div class = "my-5 border-t border-white"></div>
                    
                    <!-- Recent Contacts-->
                    <div class = "flex-1 space-y-3 overflow-y-auto">
                        {#each recentContacts as contact (contact.id)}
                            <RecentContact name={contact.name} pinned = {contact.pinned} onClick={() => openChat(contact)} unreadCount={unreadCountPerContact[contact.id] ?? 0}/>
                        {/each}
                    </div>
                </div>

                <!--Right Side-->
                <div class = "flex-1 bg-zinc-100 p-4 flex flex-col">
                    {#if selectedContact && selectedConversationId}
                        {#key selectedContact.id}
                            <!-- Chat View -->
                            <ChatPage contact={selectedContact} conversationId={selectedConversationId} onBack={closeChat} supabase={data.supabase} groupMembers={selectedContact?.id === "roommate-group" ? roommateGroup : []}/>
                        {/key}
                    {:else}
                        <!-- Search Box -->
                        <div class = "mb-4">
                            <input type="text" placeholder="Search" bind:value={search} class = "w-full p-2 rounded-lg border border-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <!-- Contact List Area -->
                        <div class = "flex-1 bg-zinc-300 rounded-lg p-4 space-y-4 overflow-y-auto">
                            {#each filteredContacts as contact (contact.id)}
                                <ContactRow 
                                    name={contact.name} 
                                    type={selectedTab === "friends" ? "friend" : selectedTab === "landlords" ? "landlord" : "requests"}
                                    unreadCount={unreadCountPerContact[contact.id] ?? 0}
                                    onMessageClick={() => openChat(contact)}
                                    onDelete={() => {
                                        if (selectedTab === "friends") removeFriend(contact);
                                        else if (selectedTab === "landlords") removeLandlord(contact);
                                    }}
                                    onReport={() => {
                                        if (selectedTab === "friends") blockFriend(contact);
                                        else if (selectedTab === "landlords") blockLandlord(contact);
                                    }}
                                    onAccept={() => acceptRequest(contact)}
                                    onReject={() => rejectRequest(contact)}
                                />  
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </Card>
    </section>
</div>