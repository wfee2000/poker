<script lang="ts">
    import "../app.css"
</script>

<slot></slot>


<style lang="postcss">
    :global(html) {
        background-color: theme(colors.onedark.gray);
        color: theme(colors.onedark.white);
    }
</style>