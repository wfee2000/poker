import {Room} from "./room";
import {clearInterval} from "timers";

export class RoomRepository {
    private static rooms: Array<Room> = [];
    private static roomIds: number[] = Array.from(Array(1000).keys());

    static get(id: number): Room | undefined {
        if (id < 1000) {
            return;
        }

        return this.rooms.find(room => room.id);
    }

    static create(): Room | undefined{
        const ONE_MINUTE= 60_000;

        if (this.roomIds.length === 0) {
            return;
        }

        let room: Room = new Room(this.roomIds.shift()!, [], setInterval(() => {
            if (room.users.length == 0) {
                room.close();
                this.rooms.splice(this.rooms.findIndex(roomToRemove => roomToRemove.id === room.id),
                    1);
                this.roomIds.push(room.id);
                this.roomIds.sort();
                clearInterval(room.timeout);
            }
        }, ONE_MINUTE));

        this.rooms.push(room);
        return room;
    }
}