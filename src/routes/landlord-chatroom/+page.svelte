<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import RecentContact from "./RecentContact.svelte";
  import ContactRow from "./ContactRow.svelte";
  import ChatPage from "./ChatPage.svelte";
  //import {recentContacts, requestContacts, type Tab} from "./tempdata";
  //import {Users} from "@lucide/svelte";
  type Contact = {id: string, name: string, image?: string};

  export let data; //from +page.server.ts

  let contacts: Contact[] = data.contacts;
  let conversations = data.conversations;
  let selectedContact: Contact | null = null;
  let selectedConversationId: string | null = null;
  let search = "";
  $: filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()));

  function openChat(contact: Contact){
    selectedContact = contact;
    //Find existing conversation with this contact
    const conversation = conversations.find(convo => 
        (convo.chat_participants as string[]).includes(contact.id));
    selectedConversationId = conversation?.id ?? null; //
  }
  function closeChat(){
    selectedContact = null;
    selectedConversationId = null;
  }
</script>

<div class = "flex-1 flex overflow-hidden">
    <section class ="p-8 flex flex-col flex-1 min-h-0">
        <Card class = "flex-1 min-h-0 p-0 overflow-hidden">
            <div class = "flex h-full">
                <!--Left Sidebar-->
                <div class = "w-72 bg-zinc-400 p-4 flex flex-col">
                    
                    <!-- Recent Contacts-->
                    <div class = "flex-1 space-y-3">
                        <p class="text-sm font-semibold text-white uppercase tracking-wider mb-2 px-1">Recent Contacts</p>
                        <div class="border-b border-white mb-3"></div>

                        {#each contacts as contact (contact.name)}
                            <RecentContact name={contact.name} image = {contact.image} onClick={() => openChat(contact)}/>
                        {/each}
                    </div>
                </div>

                <!--Right Side-->
                <div class = "flex-1 bg-zinc-100 p-4 flex flex-col">
                    {#if selectedContact && selectedConversationId}
                        {#key selectedContact.name}
                            <!-- Chat View -->
                            <ChatPage contact = {selectedContact} conversationId = {selectedConversationId} onBack={closeChat}/>
                        {/key}
                    {:else}
                        <!-- Search Box -->
                        <div class = "mb-4">
                            <input type="text" placeholder="Search" bind:value={search} class = "w-full p-2 rounded-lg border border-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <!-- Contact List Area -->
                        <div class = "flex-1 bg-zinc-300 rounded-lg p-4 space-y-4 overflow-y-auto">
                            {#each filteredContacts as contact (contact.name)}
                                <ContactRow name={contact.name} image = {contact.image} onMessageClick={() => openChat(contact)}/>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </Card>
    </section>
</div>