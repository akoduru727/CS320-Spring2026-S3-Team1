<script lang="ts">
    import ChatMessage from "./ChatMessage.svelte";
    import {tick, onMount} from "svelte";
    import {supabase} from "$lib/supabase";
    import {PersonStanding} from "@lucide/svelte";

    interface Contact{
        //id: string;
        name: string;
        pinned?: boolean;
    }
    interface Message {
        senderName: string;
        text: string;
        user: "self" | "other";
        date: Date;
    }
    interface Props {
        contact: Contact;
        conversationId: string;
        onBack: () => void;
    };
    const { contact, conversationId, onBack}: Props = $props();

    let newMessage = $state("");
    let chatArea: HTMLDivElement;
    let messages = $state<Message[]>([]);
    let currentUserId = $state<string | null>(null);
    
    async function scrollToBottom(){
        await tick();
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    async function loadMessage(){
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        const response = await fetch("?/loadMessage", { method: "POST", body: formData, credentials: "include" });
        const result = await response.json();
        console.log("loadMessage result:", result);
        if (result.type === "failure") {
            console.error("Error fetching messages: ", result.data);
            return;
        }
        const parsedData = JSON.parse(result.data);
        const json = JSON.parse(parsedData[1]);
        const messagesData = json.messages;
        currentUserId = json.currentUserId;
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages = (messagesData ?? []).map((msg:any) => ({
            senderName: msg.sender === currentUserId ? "You" : contact.name, text: msg.messages_content, user: msg.sender === currentUserId ? "self" : "other", date: new Date(msg.created_at+ "Z") // Append 'Z' to indicate UTC time
        }));
        await scrollToBottom();
    }
    async function sendMessage(){
        const trimmed = newMessage.trim();
        if (!trimmed) return;
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("messageContent", trimmed);
        const response = await fetch("?/sendMessage", { method: "POST", body: formData, credentials: "include" });
        const result = await response.json();
        if (result.type === "failure") {
            console.error("Error sending message: ", result.data);
            return;
        }
        newMessage = "";
        await scrollToBottom();
    }
    onMount(() => {
        loadMessage();

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "message",
                filter: `conversation_id=eq.${conversationId}`
                
            }, async (payload) => {
                const row = payload.new;
                messages = [...messages, {
                    senderName: row.sender === currentUserId ? "You" : contact.name,
                    text: row.messages_content,
                    user: row.sender === currentUserId ? "self" : "other",
                    date: new Date(row.created_at)
                }];
                await scrollToBottom();
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    });
</script>

<div class = "w-full flex flex-col flex-1 min-h-0">
    <!-- Header -->
    <div class = "mb-4 flex items-center gap-3">
        <button class="rounded-lg px-3 py-2 hover:bg-zinc-200 cursor-pointer" onclick={onBack}> Back </button>
        {#if contact.pinned}
            <div class="w-8 h-8 bg-blue-400 rounded-full shrink-0 flex items-center justify-center">
                <PersonStanding size={16} class="text-white"/>
            </div>
        {:else}
            <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0 flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{contact.name[0].toUpperCase()}</span>
            </div>
        {/if}
        <p class= "text-base font-semibold text-black">{contact.name}</p>
    </div>
    <!-- Chat Area -->
    <div bind:this={chatArea} class = "flex-1 bg-zinc-300 rounded-lg p-4 overflow-y-auto space-y-4 min-h-0">
        <div class = "flex flex-col justify-end min-h-full space-y-4">
            {#each messages as message, index (index)}
                <ChatMessage senderName={message.senderName} text={message.text} user={message.user} date={message.date}/>
            {/each}
        </div>
    </div>
    <!-- Input Area -->
    <div class = "mt-4 flex items-center gap-3">
        <input type="text" placeholder="Type your message..." bind:value={newMessage} class="flex-1 rounded-lg border border-zinc-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onkeydown={(event) => {
            if (event.key === "Enter") sendMessage();
        }}/>
        <button class = "rounded-lg bg-zinc-800 px-4 py-3 text-white hover:bg-zinc-700 cursor-pointer" onclick={sendMessage}> Send </button>
    </div>
</div>