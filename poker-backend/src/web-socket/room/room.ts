import { WebSocket, WebSocketServer } from "ws";
import { User } from "../user/user";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { UserRepository } from "../user/user-repository";
import { Game } from "../../game/game";
import {
	CallbackType,
	GameActionResult,
	GameMessage,
} from "../../game/game-types";
import { MessageStructure } from "../model/message-structure";

export class Room extends WebSocketServer {
	public started: boolean;
	private waitingPlayers: User[] = [];
	private waitingForOk: boolean;
	private game: Game;
	private next: (() => void) | undefined;
	constructor(
		readonly id: number,
		readonly users: User[],
		readonly timeout: NodeJS.Timer,
	) {
		super({ noServer: true });
		super.on("connection", this.onConnection);
		this.game = new Game(this);
		this.started = false;
		this.waitingForOk = false;
		this.next = undefined;
	}

	onConnection(ws: WebSocket, req: IncomingMessage) {
		
		let params = new URLSearchParams(req.url);
		if (this.users.length == 8 && params.get("id") === null) {
			ws.close(1013);
		}

		
		let user = UserRepository.get((user) => user.ws === ws)!;
		this.users.push(user);
		

		const joinMessage: MessageStructure = {
			context: "update",
			value: "users",
			content: {
				users: this.users.map((user) => ({
					username: user.name,
					balance: 1000,
				})),
			},
		};

		this.users.forEach((user) => user.ws?.send(JSON.stringify(joinMessage)));
		ws.onclose = () => {
			this.game.removePlayer(user.name);
			this.users.splice(
				this.users.findIndex((u) => u.id === user.id),
				1,
			);
			user.ws = null;
			user.currentRoom = null;
			const closeMessage: MessageStructure = {
				context: "update",
				value: "users",
				content: {
					users: this.users.map((user) => ({
						username: user.name,
					})),
				},
			};

			this.users.forEach((user) =>
				user.ws?.send(JSON.stringify(closeMessage)),
			);
		};

		if (user.currentRoom != null) {
			user.ws!.close();
		}

		ws.on("message", (data) => {
			const object = JSON.parse(data.toString());
			if (!this.started && object.context === "start") {
				let [success, message] = this.game.start();

				if (success) {
					this.started = true;
				} else {
					user.ws!.send(
						JSON.stringify({ context: "ERROR", content: message }),
					);
					console.debug(message);
				}
			}

			if (this.waitingPlayers.includes(user)) {
				if (this.waitingForOk) {
					if (object.context === "ok") {
						this.waitingPlayers.splice(
							this.waitingPlayers.indexOf(user),
							1,
						);

						if (this.waitingPlayers.length === 0) {
							
							this.game.update();
						}
					}
				} else {
					if (object.context === "bet") {
						let [success, message]: GameActionResult =
							this.game.bet(object.content);

						if (success) {
							this.waitingPlayers.splice(
								this.waitingPlayers.indexOf(user),
								1,
							);
						} else {
							user.ws!.send(
								JSON.stringify({
									context: "ERROR",
									content: message,
								}),
							);
							console.debug(message);
						}
					}
				}
			}
		});

		user.currentRoom = this;
		this.game.addPlayer(user.name);
	}

	upgrade(
		request: IncomingMessage,
		socket: Duplex,
		head: Buffer,
		id: number,
	): void {
		
		
		super.handleUpgrade(request, socket, head, async (ws) => {
			
			let taken = !(await UserRepository.connectTo(id, ws));

			

			if (taken) {
				
				ws.close(1013);
				return;
			}

			
			this.emit("connection", ws, request);
		});
	}

	onGameEvent(ct: CallbackType, data: GameMessage) {
		switch (ct) {
			case CallbackType.CLIENT_CONFIRM:
				
				this.waitingForOk = true;
				let user = this.users.find(
					(user) => user.name === data.recipient ?? "",
				)!;
				
				this.waitingPlayers.push(user);
				user.ws!.send(JSON.stringify(data));
				break;
			case CallbackType.BROADCAST_CONFIRM:
				this.waitingForOk = true;
				
				this.waitingPlayers = this.waitingPlayers.concat(this.users);
				this.users.forEach((user) =>
					user.ws!.send(JSON.stringify(data)),
				);
				break;
			case CallbackType.SPECIFIC_CLIENT_WITH_RESULT:
				{
					this.waitingForOk = false;
					let user = this.users.find(
						(user) => user.name === data.recipient ?? "",
					)!;
					this.waitingPlayers.push(
						this.users.find(
							(user) => user.name === data.recipient ?? "",
						)!,
					);
					user.ws!.send(JSON.stringify(data));
					this.next = undefined;
				}
				break;
		}
	}
}
