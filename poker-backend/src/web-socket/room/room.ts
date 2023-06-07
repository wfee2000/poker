import {WebSocket, WebSocketServer} from "ws";
import {User} from "../user/user";
import {IncomingMessage} from "http";
import {Duplex} from "stream";
import {UserRepository} from "../user/user-repository";
import {Game} from "../../game/game";
import {CallbackType, GameMessage} from "../../game/game-types";
import {MessageStructure} from "../model/message-structure";

export class Room extends WebSocketServer {
    public started: boolean;
    private waitingPlayers: User[] = [];
    private waitingForOk: boolean;
    private game: Game;
    private next: (() => void) | undefined;
    constructor(readonly id: number, readonly users: User[], readonly timeout: NodeJS.Timer) {
        super({noServer: true, path: `/${id}`});
        super.on("connection", this.onConnection);
        this.game = new Game(this.onGameEvent);
        this.started = false;
        this.waitingForOk = false;
        this.next = undefined;
    }

    onConnection(ws: WebSocket, req: IncomingMessage) {
        let params = new URLSearchParams(req.url);
        if (this.users.length == 8 && params.get("id") === null) {
            ws.close(1013);
        }

        console.log(`Room ${this.id} received connection`);
        const joinMessage: MessageStructure = {
            context: "update",
            value: "users",
            content: {
                users: this.users
            }
        }

        ws.send(JSON.stringify(joinMessage));

        let user = UserRepository.get(user => user.ws === ws)!
        ws.onclose = () => {
            this.game.removePlayer(user.name);
            this.users.splice(this.users.findIndex(user => user.ws === ws), 1);
            user.ws = null;
            user.currentRoom = null;
            const closeMessage: MessageStructure = {
                context: "update",
                value: "users",
                content: {
                    users: this.users
                }
            }

            this.users.forEach(user => user.ws!.send(JSON.stringify(closeMessage)));
        };

        if (user.currentRoom != null) {
            user.ws!.close();
        }

        ws.on("message", data => {
            const object = JSON.parse(data.toString());
            if (!this.started && object.context === "start") {
                this.started = true;
                this.game.start();
            }

            if (this.waitingPlayers.includes(user)) {
                if (this.waitingForOk) {
                    if (object.context === "ok") {
                        this.waitingPlayers.splice(this.waitingPlayers.indexOf(user), 1);

                        if (this.waitingPlayers.length === 0) {
                            this.next!();
                        }
                    }
                } else {
                    if (object.context === "bet") {
                        // @ts-ignore TODO: hellp
                        if (this.game.bet(object.content)) {
                            this.waitingPlayers.splice(
                                this.waitingPlayers.indexOf(user), 1);
                        } else {
                            user.ws!.send(JSON.stringify({context: "ERROR"}));
                        }
                    }
                }
            }
        });

        user.currentRoom = this;
        this.game.addPlayer(user.name);
        this.users.push(user);
    }

    upgrade(request: IncomingMessage, socket: Duplex, head: Buffer, id: number): void {
        super.handleUpgrade(request, socket, head, (ws) => {
            let taken = !UserRepository.connectTo(id, ws);

            if (taken) {
                ws.close(1013);
                return;
            }

            this.emit("connection", ws, request);
        });
    }

    onGameEvent(ct: CallbackType, next: () => void, data: GameMessage) {
        switch (ct) {
            case CallbackType.CLIENT_CONFIRM:
                this.waitingForOk = true;
                this.next = next;
                this.waitingPlayers.push(this.users.find(user => user.name === data.recipient ?? "")!);
                break;
            case CallbackType.BROADCAST_CONFIRM:
                this.waitingForOk = true;
                this.next = next;
                this.waitingPlayers = this.waitingPlayers.concat(this.users);
                break;
            case CallbackType.SPECIFIC_CLIENT_WITH_RESULT:
                this.waitingForOk = false;
                this.waitingPlayers.push(this.users.find(user => user.name === data.recipient ?? "")!);
                this.next = undefined;
                break;
        }
    }
}