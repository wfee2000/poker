<script lang="ts">
    import Table from "$lib/table.svelte";

    let renderPlayers : () => void;
</script>

<div class="flex items-center justify-center w-full h-screen">
    <Table bind:positionPlayers={renderPlayers}/>
</div>