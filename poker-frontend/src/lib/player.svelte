<script lang="ts">
    export let player : {name:string, balance:number};
</script>

<div class="px-2 border-2 rounded-md w-fill bg-onedark-darkblue border-onedark-lightgray">
    <p class="text-center">{player.name}</p>
    <p class="text-center">{player.balance} Динар</p>
</div>