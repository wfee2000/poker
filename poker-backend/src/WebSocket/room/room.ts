import {CloseEvent, WebSocket, WebSocketServer} from "ws";
import {User} from "../user/user";
import {IncomingMessage} from "http";
import {Duplex} from "stream";
import {UserRepository} from "../user/user-repository";

export class Room extends WebSocketServer {
    constructor(readonly id: number, readonly users: User[], readonly timeout: NodeJS.Timer) {
        super({noServer: true, path: `/${id}`});
        super.on("connection", this.onConnection);
    }

    onConnection(ws: WebSocket, req: IncomingMessage) {
        let params = new URLSearchParams(req.url);
        if (this.users.length == 8 && params.get("id") === null) {
            ws.close(1013);
        }

        console.log(`Room ${this.id} received connection`);
        // send ws amount of current waiting clients // TODO: JSON roomid && list users
        this.users.push(new User(0, "", ws));
        ws.onclose = (event) => {
            this.users.splice(this.users.findIndex(user => user.ws === ws), 1);
            this.users.forEach(user => user.ws!.send("weg mit dir")) // TODO: JSON
        };
    }

    upgrade(request : IncomingMessage, socket : Duplex, head : Buffer, id: number) {
        super.handleUpgrade(request, socket, head, (ws) => {
            let taken = !UserRepository.connectTo(id, ws);

            if (taken) {
                ws.close(1013);
                return;
            }

            this.emit("connection", ws, request);
        });
    }
}