import {WebSocket} from "ws";
import {Room} from "../room/room";

export class User {
    public ws: WebSocket | null;
    public currentRoom: Room | null;
    constructor(readonly id: number, readonly name: string) {
        this.ws = null;
        this.currentRoom = null;
    }
}