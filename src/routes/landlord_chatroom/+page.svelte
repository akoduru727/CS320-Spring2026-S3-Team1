<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import SidebarButton from "./SidebarButton.svelte";
  import RecentContact from "./RecentContact.svelte";
  import ContactRow from "./ContactRow.svelte";
  // @ts-ignore
  import ChatPage from "./ChatPage.svelte";
  import {recentContacts, requestContacts, type Tab} from "./tempdata";
  import {Users, House, Mail} from "@lucide/svelte";
  type Contact = {name: string, image?: string};
  
  let selectedTab: Tab = "contacts";
  let selectedContact: Contact | null = null;
  let search = "";
  $: shownContacts = selectedTab === "friends" ? friendContacts : selectedTab === "landlords" ? landlordContacts : requestContacts;
  $: filteredContacts = shownContacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()));

  function openChat(contact: Contact){
    selectedContact = contact;
  }
  function closeChat(){
    selectedContact = null;
  }
</script>

<div class = "flex-1 flex overflow-hidden">
    <section class ="p-8 flex flex-col flex-1 min-h-0">
        <Card class = "flex-1 min-h-0 p-0 overflow-hidden">
            <div class = "flex h-full">
                <!--Left Sidebar-->
                <div class = "w-72 bg-zinc-400 p-4 flex flex-col">
                    <div class = "space-y-3">
                    <SidebarButton text="Friends" icon= {Users} onClick={() => selectedTab = "friends"}/>
                    <SidebarButton text="Message Requests" icon= {Mail} onClick={() => selectedTab = "requests"}/>
                    </div>

                    <div class = "my-5 border-t border-white"></div>
                    
                    <!-- Recent Contacts-->
                    <div class = "flex-1 space-y-3 overflow-y-auto">
                        {#each recentContacts as contact (contact.name)}
                            <RecentContact name={contact.name} image = {contact.image} onClick={() => openChat(contact)}/>
                        {/each}
                    </div>
                </div>

                <!--Right Side-->
                <div class = "flex-1 bg-zinc-100 p-4 flex flex-col">
                    {#if selectedContact}
                        {#key selectedContact.name}
                            <!-- Chat View -->
                            <ChatPage contact = {selectedContact} onBack={closeChat}/>
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