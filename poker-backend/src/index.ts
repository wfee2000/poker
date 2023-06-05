import WebSocket from "ws";
import {Game} from "./game/game";

/*const wss = new WebSocket.Server({port: 5000});

wss.on('connection', socket => {
    socket.on('message', message => {
        socket.send(message);
    });
});*/

let game: Game = new Game();

console.log(game.bigBlind);
console.log(game.smallBlind);
console.log(game.startBalance);