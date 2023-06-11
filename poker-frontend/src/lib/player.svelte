<script lang="ts">
    export let player : {name:string, balance:number, lastAction?: string};
    export let style : string = "";
    export let index : number;
</script>

<div id="player {index}" class="absolute invisible px-2 border-2 rounded-md w-fill bg-onedark-darkblue border-onedark-lightgray {style}">
    <p class="text-xl text-center">{player.name}</p>
    <p class="text-center">{player.balance} Динар</p>
    {#if player.lastAction}
    <div class="w-full border-t border-onedark-lightgray">
        <p class="text-center">
            {player.lastAction}
        </p>
    </div>
    {/if}
</div>