<script lang="ts">
    import "../app.css";
    import Logo from "$lib/logo.svelte";
</script>

<div class="grid items-center justify-around grid-cols-3 bg-onedark-darkblue">
    <a href="/" class="p-2">
        <Logo/>
    </a>
    <a href="/rooms" class="font-mono text-2xl text-center">Rooms</a>
    <a href="/auth/login" class="font-mono text-2xl text-center">Login</a>
</div>

<slot></slot>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.onedark.gray);
        color: theme(colors.onedark.white);
    }
</style>