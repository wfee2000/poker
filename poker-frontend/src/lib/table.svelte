<script lang="ts">
	import { onMount } from "svelte";
	import Player from "./player.svelte";
	import Card from "./card.svelte";
	import DefaultCard from "./defaultCard.svelte";

    export let players : {
        name : string,
        balance : number
    }[];

    let communityCards : {
        rank: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |13 | 14
        suit: "♣" |"♠" | "♦" | "♥"
    }[] = [
        {suit: "♣", rank: 14},
        {suit: "♠", rank: 14},
        {suit: "♦", rank: 14},
    ];

    let hiddenCards = new Array(2);
</script>

<div class="flex items-center justify-center w-2/3 rounded-full h-1/2 bg-onedark-darkblue">
    <div class="grid items-center w-1/2 grid-cols-5">
    {#each communityCards as {rank, suit}}
        <div class="px-2">
            <Card rank={rank} suit={suit}/>
        </div>
    {/each}
    {#each hiddenCards as hiddenCard}
        <div class="px-2">
            <DefaultCard/>
        </div>
    {/each}
    </div>
</div>

<div class="absolute top-[calc(100vh-28vh)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-77.7vh)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-50vh-3vh)] left-[calc(100vw-86vw)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-50vh-3vh)] left-[calc(100vw-19.5vw)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-28vh)] left-[calc(100vw-30vw)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-78vh)] left-[calc(100vw-30vw)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-78vh)] left-[calc(100vw-75vw)]">
    <Player player={players[0]}/>
</div>

<div class="absolute top-[calc(100vh-28vh)] left-[calc(100vw-75vw)]">
    <Player player={players[0]}/>
</div>