import WebSocket from "ws";

const wss = new WebSocket.Server({port: 5000});

wss.on('connection', socket => {
    socket.on('message', message => {
        socket.send(message);
    });
});