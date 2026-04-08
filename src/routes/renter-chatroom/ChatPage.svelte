<script lang="ts">
    import ChatMessage from "./ChatMessage.svelte";
    import {tick, onMount} from "svelte";
    interface Contact{
        name: string;
        image?: string;
    }
    interface Message {
        senderName: string;
        profilePic?: string;
        text: string;
        user: "self" | "other";
        date: Date;
    }
    interface Props {
        contact: Contact;
        onBack: () => void;
    };
    const { contact, onBack}: Props = $props();
    let newMessage = $state("");
    let chatArea: HTMLDivElement;
    let messages = $state<Message[]>([
        {senderName: contact.name, profilePic: contact.image, text: "Hi there!", user: "other", date: new Date()},
        {senderName: "You", profilePic: contact.image, text: "Hello! How are you?", user: "self", date: new Date()},
        {senderName: contact.name, profilePic: contact.image, text: "I'm good, thanks! What about you?", user: "other", date: new Date()}
    ]);
    async function scrollToBottom(){
        await tick();
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    async function sendMessage(){
        const trimmed = newMessage.trim();
        if (!trimmed) return;
        messages = [...messages, {senderName: "You", text: trimmed, user: "self", date: new Date()}];
        newMessage = "";
        await scrollToBottom();
    }
    onMount(async () => await scrollToBottom());
</script>

<div class = "w-full flex flex-col flex-1 min-h-0">
    <!-- Header -->
    <div class = "mb-4 flex items-center gap-3">
        <button class="rounded-lg px-3 py-2 hover:bg-zinc-200 cursor-pointer" onclick={onBack}> Back </button>
        {#if contact.image}
            <img src={contact.image} alt="Profile Picture" class="w-8 h-8 rounded-full object-cover shrink-0"/>
        {:else}
            <div class="w-8 h-8 bg-orange-300 rounded-full shrink-0"></div>
        {/if}
        <p class= "text-base font-semibold text-black">{contact.name}</p>
    </div>
    <!-- Chat Area -->
    <div bind:this={chatArea} class = "flex-1 bg-zinc-300 rounded-lg p-4 overflow-y-auto space-y-4 min-h-0">
        <div class = "flex flex-col justify-end min-h-full space-y-4">
            {#each messages as message, index (index)}
                <ChatMessage senderName={message.senderName} profilePic={message.profilePic} text={message.text} user={message.user} date={message.date}/>
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