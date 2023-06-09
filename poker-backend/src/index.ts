import WebSocket from "ws";
import {Player} from "./game/player";
import {Card, CardColor, PokerEvaluate} from "./game/card";

const wss = new WebSocket.Server({port: 5000});

wss.on('connection', socket => {
    socket.on('message', message => {
        socket.send(message);
    });
});