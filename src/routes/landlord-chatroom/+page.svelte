<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import RecentContact from "./RecentContact.svelte";
  import ContactRow from "./ContactRow.svelte";
  import ChatPage from "./ChatPage.svelte";
  import {onMount} from "svelte";
  import { totalUnreadCount } from "$lib/components/unreadStore";
  //import {supabase} from "$lib/supabase";
  //import {recentContacts, requestContacts, type Tab} from "./tempdata";
  //import {Users} from "@lucide/svelte";
  type Contact = {id: string, name: string};

  export let data:{
    supabase: any;
    contacts: Contact[];
    conversations: {id: string, chat_participants: string[], messages_id: string[]}[];
    messages: {id: string, created_at: string, sender: string, messages_content: string, conversation_id: string, is_read: boolean, read_at: string | null}[];
    currentUserId: string;
  }; //from +page.server.ts

  let contacts: Contact[] = data.contacts;
  let conversations = data.conversations;
  let messages = data.messages;
  let selectedContact: Contact | null = null;
  let selectedConversationId: string | null = null;
  let search = "";
  $: filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()));
  $: unreadCountPerContact = Object.fromEntries(contacts.map(contact => {
    const convo = conversations.find(c => (c.chat_participants as string[]).includes(contact.id));
    const unreadCount = convo ? messages.filter(m => m.conversation_id === convo.id && !m.is_read && m.sender !== data.currentUserId).length : 0;
    return [contact.id, unreadCount];
  }));
  $: totalUnread = Object.values(unreadCountPerContact).reduce((sum, count) => sum + count, 0);
  $: totalUnreadCount.set(totalUnread);

  async function openChat(contact: Contact){
    selectedContact = contact;
    //Find existing conversation with this contact
    const conversation = conversations.find(convo => 
        (convo.chat_participants as string[]).includes(contact.id));
    selectedConversationId = conversation?.id ?? null;
    console.log("conversation found:", conversation);
    console.log("all conversations:", conversations);
    if (conversation){
        const formData = new FormData();
        formData.append("conversationId", conversation.id);
        await fetch("?/markAsRead", { method: "POST", body: formData });
        messages = messages.map(m => 
            (m.conversation_id === conversation.id && m.sender !== data.currentUserId) ? {...m, is_read: true} : m
        );
    }
  }
  function closeChat(){
    selectedContact = null;
    selectedConversationId = null;
  }
  async function blockTenant(contact: Contact){
    const formData = new FormData();
    formData.append("contactId", contact.id);
    await fetch("?/blockTenant", { method: "POST", body: formData });
    contacts = contacts.filter(c => c.id !== contact.id);
  }
  onMount(() => {
    const channel = data.supabase.channel("new-messages-landlord").on("postgres_changes", {event: "INSERT", schema: "public", table: "message"}, 
    payload => {
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
    }).subscribe();
    return () => data.supabase.removeChannel(channel);
  });
</script>

<div class = "flex-1 flex overflow-hidden">
    <section class ="p-8 flex flex-col flex-1 min-h-0">
        <Card class = "flex-1 min-h-0 p-0 overflow-hidden">
            <div class = "flex h-full">
                <!--Left Sidebar-->
                <div class = "w-72 bg-zinc-400 p-4 flex flex-col">
                    
                    <!-- Recent Contacts-->
                    <div class = "flex-1 space-y-3 overflow-y-auto">
                        <p class="text-sm font-semibold text-white uppercase tracking-wider mb-2 px-1">
                            Recent Contacts
                            {#if totalUnread > 0}
                                <span class="ml-2 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs rounded-full inline-flex items-center justify-center">{totalUnread}</span>
                            {/if}
                        </p>
                        <div class="border-b border-white mb-3"></div>

                        {#each contacts as contact (contact.id)}
                            <RecentContact name={contact.name} onClick={() => openChat(contact)} unreadCount={unreadCountPerContact[contact.id] ?? 0}/>
                        {/each}
                    </div>
                </div>

                <!--Right Side-->
                <div class = "flex-1 bg-zinc-100 p-4 flex flex-col">
                    {#if selectedContact && selectedConversationId}
                        {#key selectedContact.id}
                            <!-- Chat View -->
                            <ChatPage contact = {selectedContact} conversationId = {selectedConversationId} onBack={closeChat} supabase={data.supabase}/>
                        {/key}
                    {:else}
                        <!-- Search Box -->
                        <div class = "mb-4">
                            <input type="text" placeholder="Search" bind:value={search} class = "w-full p-2 rounded-lg border border-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <!-- Contact List Area -->
                        <div class = "flex-1 bg-zinc-300 rounded-lg p-4 space-y-4 overflow-y-auto">
                            {#each filteredContacts as contact (contact.id)}
                                <ContactRow name={contact.name} unreadCount = {unreadCountPerContact[contact.id] ?? 0} onMessageClick={() => openChat(contact)} onBlock={() => blockTenant(contact)}/>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </Card>
    </section>
</div>