<script lang="ts">
  export let avatarUrl = "";
  export let firstName = "";

  $: initial = (firstName.trim()[0] ?? "?").toUpperCase();
  $: fallbackAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='lightgray'/><text x='50%' y='65%' text-anchor='middle' font-size='48' fill='black' font-family='Arial'>${initial}</text></svg>`,
  )}`;
  $: profilePic = avatarUrl || fallbackAvatar;
</script>

<img 
  src={profilePic}
  alt={`${firstName || "User"}'s profile picture`}
  class="avatar"
/>

<style>
  .avatar {
    width: 10%;
    height: 10%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }
</style>
