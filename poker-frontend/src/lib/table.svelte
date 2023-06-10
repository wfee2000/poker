<script lang="ts">
	import { onMount } from "svelte";
	import Player from "./player.svelte";
	import Card from "./card.svelte";
    import {pixelsToVh, pixelsToVw} from "$lib/utils"
    import type {Card as card} from "$lib/types"
	import { error } from "@sveltejs/kit";

    export let players : {
        name : string,
        balance : number
    }[] = [
        {name: "luka zwiebel", balance: 1000},
        {name: "schludermännchen", balance: 1000},
        {name: "winholde", balance: 1000},
        {name: "AAIchninger", balance: 1000},
        {name: "der dude rechts", balance: 1000},
        {name: "der dude links", balance: 1000},
        {name: "rrrrrrrrrrr", balance: 1000},
        {name: "XxPokerProxX", balance: 1000},
    ];

    let communityCards : card[] = [
        {suit: "♣", rank: 14},
        {suit: "♠", rank: 14},
        {suit: "♦", rank: 14},
    ];

    let hand : card[] = [
        {suit: "♣", rank: 13},
        {suit: "♥", rank: 13},
    ];

    let amount = 10;

    let hiddenCards = new Array(2);

    onMount(() => {
        positionPlayers();
    });

    export const positionPlayers = () => {
        players.forEach((player, index) => {
            positionPlayer(index);
            positionCard(index, hand);
        });
    }

    const positionPlayer = (id : number) => {
        let div = document.getElementById(`player ${id}`);
        if(!div) return "?";

        if(id == 0) {
            div.style.setProperty("top", `${(300/4) - pixelsToVh(div.clientHeight)/2}vh`);
        }
        if(id == 1) {
            div.style.setProperty("top", `${(100/4) - pixelsToVh(div.clientHeight)/2}vh`);
        }
        if(id == 2) {
            div.style.setProperty("left", `${100/6 - pixelsToVw(div.clientWidth)/2}vw`);
        }
        if(id == 3) {
            div.style.setProperty("left", `${500/6 - pixelsToVw(div.clientWidth)/2}vw`);
        }

        if(id == 4 || id == 5){
            div.style.setProperty("top", `${(100/4) - pixelsToVh(div.clientHeight)/2}vh`);
            if(id == 4) {
                div.style.setProperty("left", `${(450/6) - pixelsToVw(div.clientWidth)/2}vw`);
            }
            if(id == 5) {
                div.style.setProperty("left", `${(150/6) - pixelsToVw(div.clientWidth)/2}vw`);
            }
        } 
        
        if(id == 6 || id == 7){
            div.style.setProperty("top", `${(300/4) - pixelsToVh(div.clientHeight)/2}vh`);
            if(id == 6) {
                div.style.setProperty("left", `${(450/6) - pixelsToVw(div.clientWidth)/2}vw`);
            }
            if(id == 7) {
                div.style.setProperty("left", `${(150/6) - pixelsToVw(div.clientWidth)/2}vw`);
            }
        }
        
        div.classList.remove("invisible");
    }

    const positionCard = (id : number, hand : card[]) => {
        if(hand.length != 2) return;
        
        const player = document.getElementById(`player ${id}`);
        if(!player) return;

        const cardWidth = 90;
        const cardHeight = 125;

        const rect = player.getBoundingClientRect();

        new Card({
            target: document.body,
            props: {
                rank: hand[0].rank,
                suit: hand[0].suit,
                style: `absolute z-0 -rotate-[20deg] card`,
                left: pixelsToVw(rect.left),
                top: pixelsToVh(rect.top) - pixelsToVh(cardHeight/2),
            }
        });

        new Card({  
            target: document.body,
            props: {
                rank: hand[1].rank,
                suit: hand[1].suit,
                style: "absolute z-0 card",
                left: pixelsToVw(rect.left) + pixelsToVw(cardWidth/2),
                top: pixelsToVh(rect.top) - pixelsToVh(cardHeight/2),
            }
        })
    }

    const removeCards = () => {
        let cards = document.querySelectorAll<HTMLDivElement>(".card");

        cards.forEach((card) => {
            card.remove();
        })
    }
    
    let rangeAmount : number = 2*amount;
</script>

<div class="flex items-center justify-center w-2/3 rounded-full h-1/2 bg-onedark-darkblue">
    <div class="grid items-center grid-cols-5">
    {#each communityCards as {rank, suit}}
        <div class="flex justify-center mr-2">
            <Card rank={rank} suit={suit}/>
        </div>
    {/each}
    {#each hiddenCards as hiddenCard}
        <div class="flex justify-center h-full mr-2 border rounded-md border-onedark-lightgray">
            
        </div>
    {/each}
    </div>
</div>

{#each players as player, i}
    <Player player={player} index={i} style={"z-10"}/>
{/each}


<div class="absolute top-[82vh] grid grid-cols-3 w-1/6 space-x-4">
    <button class="p-2 rounded-xl bg-onedark-darkblue">
        CALL {amount}
    </button>
    <button class="p-2 bg-onedark-darkblue rounded-xl">
        FOLD
    </button>
    <div class="w-full">
        <button class="w-full p-2 bg-onedark-darkblue rounded-xl">
            RAISE {rangeAmount}
        </button>
        <input bind:value={rangeAmount} type="range" class="w-full h-2 bg outline-none bg-onedark-darkblue [&::-moz-range-thumb]:bg-onedark-lightgray [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:h-5" min="{2*amount}" max="{players[0].balance}">
    </div>
</div>