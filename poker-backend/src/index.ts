import express from "express";
import {UserRepository} from "./WebSocket/user/user-repository";
import {RoomRepository} from "./WebSocket/room/room-repository";

const app = express();

app.post("/login", (req, res) => {
    let name = req.body.name;
    let id = 0;
    // TODO: confirm login
    if (true) {
        if (UserRepository.login(id, name)) {
            res.status(200).send(id);
            return;
        } else {
            res.status(403).send("User already logged in");
            return;
        }
    }

    res.status(401).send("Login failed");
});

const server = app.listen(5000);

server.on("upgrade", (request, socket, head) => {
    if (!request.url) {
        socket.destroy();
        return;
    }

    let params = new URLSearchParams(request.url);
    let id = params.get("id");
    let roomId = params.get("roomId");

    if (id === null) {
        socket.write("HTTP/1.1 401 Unauthorized\\r\\n\\r\\n");
        return;
    }

    let user = UserRepository.get(parseInt(id));

    if (!user || user.ws !== null) {
        socket.write("HTTP/1.1 403 Forbidden\\r\\n\\r\\n");
        return;
    }

    let room;

    if (roomId === null) {
        room = RoomRepository.create();
    } else {
        room = RoomRepository.get(parseInt(roomId));
    }

    if (!room) {
        socket.write("HTTP/1.1 400 Bad Request\\r\\n\\r\\n");
        return;
    }

    room.upgrade(request, socket, head, parseInt(id));
});