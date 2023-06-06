<script lang="ts">
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