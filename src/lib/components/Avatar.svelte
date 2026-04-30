<script lang="ts">
    export let avatarUrl = ''
    export let firstName = ''

    const initial = firstName ? firstName[0].toUpperCase() : '?'

    const fallbackAvatar = `
        data:image/svg+xml;utf8,
        <svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>
        <rect width='100%' height='100%' fill='lightgray'/>
        <text
            x='50%'
            y='65%'
            text-anchor='middle'
            font-size='48'
            fill='black'
            font-family='Arial'
        >
            ${initial}
        </text>
    </svg>
    `

    const profilePic = avatarUrl || fallbackAvatar
</script>

<img 
  src={profilePic}
  alt="{firstName}'s profile picture"
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