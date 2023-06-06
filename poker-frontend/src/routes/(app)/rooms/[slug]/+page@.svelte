<script lang="ts">
    import Table from "$lib/table.svelte";

    let players : {name:string, balance:number}[] = [
        {name: "yo mama", balance: 5678}
    ];
</script>

<div class="flex items-center justify-center w-full h-screen">
    <Table bind:players={players}/>
</div>
