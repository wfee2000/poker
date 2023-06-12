<script lang="ts">
	import type { PageServerData } from "./$types";
	import { onMount } from "svelte";
	import { tick } from "svelte";

	let ws: WebSocket | undefined;

	export let data: PageServerData;
	let name = "";

	let players: {
		name: string;
		balance: number;
		lastAction?: string;
		cards? : card[]
	}[] = [];

	let gameStarted = false;
	let bet = false;

	onMount(async () => {
		name = await (
			await fetch(`http://localhost:5000/users/${data.id}`)
		).text();
		ws = new WebSocket(
			`ws://localhost:5000/?id=${data.id}&roomId=${data.roomId}`,
		);
		ws.onopen = () => {
			console.log("connected");
		};
		ws.onmessage = async (e) => {
			const message = JSON.parse(e.data);

			console.log(message);

			if (message.gameEvent == 0) {
				gameStarted = true;
				players = message.content.map((player: any) => ({
					name: player.name,
					balance: player.balance,
				}));
				let thisPlayer = players.find((a) => a.name == name);
				players.splice(
					players.findIndex((a) => a.name == thisPlayer?.name),
					1,
				);
				players = [thisPlayer!, ...players];
				console.log(players);
				await tick();
				positionPlayers();

				ws?.send(
					JSON.stringify({
						context: "ok",
					}),
				);
			} else if (
				message.context == "update" &&
				message.value == "users"
			) {
				players = message.content.users.map((player: any) => ({
					name: player.username,
					balance: 0,
				}));
				console.log(players);
				await tick();
				positionPlayers();
			} else if (message.gameEvent == 1) {
				let hand = message.content.map((card: [string, string]) => ({
					suit: card[0],
					rank: Number(card[1]),
				}));
				await tick();
				positionCard(0, hand);
				players[0].cards = hand;
				players[0].lastAction = evalCards(hand);
				ws?.send(
					JSON.stringify({
						context: "ok",
					}),
				);
			} else if (message.gameEvent == 2) {
				bet = true;
			} else if (message.context == "ERROR") {
				bet = true;
			} else if (message.gameEvent == 3) {
				let player = players.find(
					(a) => a.name == message.content.name,
				);
				if (!player) return;

				player.balance -= message.content.amount ?? 0;
				if(player.name != name) {
					player.lastAction = message.content.action;
				}
				player = player;
				players = players;

				ws?.send(
					JSON.stringify({
						context: "ok",
					}),
				);

				if (player.name === name) {
					bet = false;
				}
			} else if (message.gameEvent == 4) {
				communityCards = message.content.map(
					(card: [string, string]) => ({
						suit: card[0],
						rank: Number(card[1]),
					}),
				);

				if(players[0].cards !== undefined) {
					players[0].lastAction = evalCards([...players[0].cards, ...communityCards])
				}

				players = players;

				await tick();

				ws?.send(
					JSON.stringify({
						context: "ok",
					}),
				);
			} else if (message.gameEvent == 5) {
				message.content.hands.forEach((hand: any) => {
					let player = players.find((a) => a.name == hand.name);
					if(!player) return;
					let cards = hand.cards.map((card: [string, string]) => ({
							suit: card[0],
							rank: Number(card[1]),
						}));
					player.lastAction = evalCards([...cards, ...communityCards]);
					player = player;
					players = players;
					if (player.name == name) return;
					positionCard(
						players.indexOf(player),
						cards,
					);
					//player.balance += message.content.amountPerWinner;
				});

				message.content.winners.forEach((winner: any) => {
					let player = players.find((a) => a.name == winner.name);
					if (!player) return;
					//player.balance += message.content.amountPerWinner;
					player.lastAction += " won";
					player = player;
					players = players;
				});

				let timeout = setTimeout(() => {
					ws?.send(
						JSON.stringify({
							context: "ok",
						}),
					);
					clearTimeout(timeout)
				}, 10_000);
			} else if (message.gameEvent == 6) {
				gameStarted = false;
				removeCards();
				communityCards = [];

				ws?.send(JSON.stringify({
					context: "ok"
				}))
			}
		};
		ws.onerror = (e) => {
			console.log(e);
		};
		ws.onclose = () => {
			console.log("disconnected");
		};
	});

	import Player from "$lib/player.svelte";
	import Card from "$lib/card.svelte";
	import { pixelsToVh, pixelsToVw } from "$lib/utils";
	import type { Card as card } from "$lib/types";
	import { evalCards } from "$lib/card";

	let communityCards: card[] = [];
	$: hiddenCards = new Array(5 - communityCards.length);
	let amount = 10;

	const positionPlayers = () => {
		players.forEach((player, index) => {
			positionPlayer(index);
		});
	};

	const positionPlayer = (id: number) => {
		console.log("cock and ball torture");
		let div = document.getElementById(`player ${id}`);
		if (!div) return "?";

		console.log("this is monke dick");

		if (id == 0) {
			div.style.setProperty(
				"top",
				`${300 / 4 - pixelsToVh(div.clientHeight) / 2}vh`,
			);
		}
		if (id == 1) {
			div.style.setProperty(
				"top",
				`${100 / 4 - pixelsToVh(div.clientHeight) / 2}vh`,
			);
		}
		if (id == 2) {
			div.style.setProperty(
				"left",
				`${100 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
			);
		}
		if (id == 3) {
			div.style.setProperty(
				"left",
				`${500 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
			);
		}

		if (id == 4 || id == 5) {
			div.style.setProperty(
				"top",
				`${100 / 4 - pixelsToVh(div.clientHeight) / 2}vh`,
			);
			if (id == 4) {
				div.style.setProperty(
					"left",
					`${450 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
				);
			}
			if (id == 5) {
				div.style.setProperty(
					"left",
					`${150 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
				);
			}
		}

		if (id == 6 || id == 7) {
			div.style.setProperty(
				"top",
				`${300 / 4 - pixelsToVh(div.clientHeight) / 2}vh`,
			);
			if (id == 6) {
				div.style.setProperty(
					"left",
					`${450 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
				);
			}
			if (id == 7) {
				div.style.setProperty(
					"left",
					`${150 / 6 - pixelsToVw(div.clientWidth) / 2}vw`,
				);
			}
		}

		div.classList.remove("invisible");
	};

	const positionCard = (id: number, hand: card[]) => {
		console.log(`player ${id} has ${hand.length} cards`);
		if (hand.length != 2) return;

		const player = document.getElementById(`player ${id}`);
		if (!player) return;

		const cardWidth = 90;
		const cardHeight = 125;

		const rect = player.getBoundingClientRect();

		new Card({
			target: document.body,
			props: {
				rank: hand[0].rank,
				suit: hand[0].suit,
				style: `absolute z-0 -rotate-[20deg] card transition-all duration-500 hover:-translate-y-10 hover:rotate-[0deg] hover:z-10 hover:after:-rotate-[20deg] hover:after:translate-y-0 hover:after:z-0`,
				left: pixelsToVw(rect.left),
				top: pixelsToVh(rect.top) - pixelsToVh(cardHeight / 2),
			},
		});

		new Card({
			target: document.body,
			props: {
				rank: hand[1].rank,
				suit: hand[1].suit,
				style: "absolute z-0 card hover:-translate-y-10 transition-all duration-500 hover:-translate-y-10 hover:z-10 hover:after:translate-y-0 hover:after:z-0",
				left: pixelsToVw(rect.left) + pixelsToVw(cardWidth / 2),
				top: pixelsToVh(rect.top) - pixelsToVh(cardHeight / 2),
			},
		});
	};

	const removeCards = () => {
		let cards = document.querySelectorAll<HTMLDivElement>(".card");

		cards.forEach((card) => {
			card.remove();
		});
	};

	let rangeAmount: number = 2 * amount;
</script>

<div class="flex items-center justify-center w-full h-screen">
	<div
		class="flex items-center justify-center w-2/3 rounded-full h-1/2 bg-onedark-darkblue"
	>
		{#if gameStarted}
			<div class="grid items-center grid-cols-5">
				{#each communityCards as { rank, suit }}
					<div class="flex justify-center mr-2">
						<Card {rank} {suit} />
					</div>
				{/each}
				{#each hiddenCards as hiddenCard}
					<div
						class="flex justify-center w-[90px] h-[125px] mr-2 border rounded-md border-onedark-lightgray"
					/>
				{/each}
			</div>
		{/if}
	</div>

	{#each players as player, i}
		<Player {player} index={i} style={"z-10"} />
	{/each}

	{#if gameStarted}
		{#if bet}
			<div class="absolute top-[82vh] grid grid-cols-3 w-1/6 space-x-4">
				<button
					class="p-2 rounded-xl bg-onedark-darkblue"
					on:click={() => {
						ws?.send(
							JSON.stringify({
								context: "bet",
								content: {
									action: "call",
									amount: amount,
								},
							}),
						);
					}}
				>
					CALL {amount}
				</button>
				<button
					class="p-2 bg-onedark-darkblue rounded-xl"
					on:click={() => {
						ws?.send(
							JSON.stringify({
								context: "bet",
								content: {
									action: "fold",
								},
							}),
						);
					}}
				>
					FOLD
				</button>
				<div class="w-full">
					<button
						class="w-full p-2 bg-onedark-darkblue rounded-xl"
						on:click={() => {
							ws?.send(
								JSON.stringify({
									context: "bet",
									content: {
										action: "raise",
										amount: rangeAmount,
									},
								}),
							);
						}}
					>
						RAISE {rangeAmount}
					</button>
					<input
						bind:value={rangeAmount}
						type="range"
						class="w-full h-2 bg outline-none bg-onedark-darkblue [&::-moz-range-thumb]:bg-onedark-lightgray [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:h-5"
						min={2 * amount}
						max={!players[0] ? 1000 : players[0].balance}
					/>
				</div>
			</div>
		{/if}
	{:else}
		<button
			class="absolute w-40 h-16 font-bold bg-onedark-green rounded-xl text-onedark-darkblue"
			on:click={() => {
				ws?.send(
					JSON.stringify({
						context: "start",
					}),
				);
			}}
		>
			Start Game
		</button>
	{/if}
</div>
