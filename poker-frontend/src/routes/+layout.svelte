<script lang="ts">
    import "../app.css";
    import Logo from "$lib/logo.svelte";
</script>

<div class="flex items-center justify-around bg-onedark-darkblue">
    <a href="/" class="p-2">
        <Logo/>
    </a>
    <a href="/about" class="font-mono text-xl">About</a>
    <a href="/contact" class="font-mono text-xl">Contact</a>
</div>

<slot></slot>


<style lang="postcss">
    :global(html) {
        background-color: theme(colors.onedark.gray);
        color: theme(colors.onedark.white);
    }
</style>