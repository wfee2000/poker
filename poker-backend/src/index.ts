import WebSocket from "ws";
import {Player} from "./game/player";
import {Card, CardColor, PokerEvaluate} from "./game/card";

/*const wss = new WebSocket.Server({port: 5000});

wss.on('connection', socket => {
    socket.on('message', message => {
        socket.send(message);
    });
});*/

let p1 = new Player("keko1", 1000);
let p2 = new Player("keko2", 1000);

let cc: Card[] = [
    [CardColor.HEART, 10],
    [CardColor.HEART, 11],
    [CardColor.HEART, 12],
    [CardColor.HEART, 13],
    [CardColor.HEART, 14]
];

p1.cards = [[CardColor.CLOVER, 6], [CardColor.CLOVER, 8]];
p2.cards = [[CardColor.CLOVER, 2], [CardColor.DIAMOND, 3]];

console.log(PokerEvaluate.evalWinners([p1], cc));
