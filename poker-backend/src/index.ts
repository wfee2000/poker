import express, {Request, Response} from "express";
import {UserRepository} from "./web-socket/user/user-repository";
import {RoomRepository} from "./web-socket/room/room-repository";

const app = express();

function validateLoginBody(req: Request, res: Response) {
    if (!req.body || typeof req.body.name !== "string") {
        res.status(401).send("Login failed");
        return false;
    }

    return false
}

app.post("/login", (req, res) => {
    if (!validateLoginBody(req, res)) {
        return;
    }

    let name = req.body.name;
    let id = 0;
    // TODO: confirm login
    if (true) {
        if (UserRepository.login(id, name)) {
            res.status(200).send(id);
        } else {
            res.status(403).send("User already logged in");
        }

        return;
    }

    res.status(401).send("Login failed");
});

app.post("/register", (req, res) => {
    if (!validateLoginBody(req, res)) {
        return;
    }

    let name = req.body.name;
    let id = 0;
    // TODO: does user not exist
    if (true) {
        if (UserRepository.login(id, name)) {
            res.status(200).send(id);
        } else {
            res.sendStatus(500);
        }

        return;
    }

    res.status(401).send("User already exists");
});

app.post("/logout", (req, res) => {
    if (!req.body || !isNaN(parseInt(req.body.id))) {
        res.sendStatus(400);
        return;
    }

    if (UserRepository.logout(parseInt(req.body.id))) {
        res.sendStatus(200);
        return;
    }

    res.status(401).send("User was not logged in");
})

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