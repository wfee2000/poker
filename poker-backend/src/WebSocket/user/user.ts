import {WebSocket} from "ws";

export class User {
    public ws: WebSocket | null;
    constructor(readonly id: number, readonly name: string, ws: WebSocket | null) {
        this.ws = ws;
    }
}