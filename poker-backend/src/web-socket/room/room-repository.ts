import {Room} from "./room";
import {clearInterval} from "timers";
import {Mutex} from "async-mutex";

export class RoomRepository {
    private static rooms: Array<Room> = [];
    private static roomIds: number[] = Array.from(Array(1000).keys());
    private static mutex: Mutex = new Mutex();

    static get(id: number): Room | undefined {
        if (id >= 1000) {
            return;
        }

        

        return this.rooms.find(room => room.id === id);
    }

    static getAllIds(): number[] {
        return this.rooms.map(room => room.id);
    }

    static getAll() {
        
        return this.rooms.filter(room => !room.started).map(room => {
            return {
                id : room.id,
                users: room.users.length,
            }
        });
    }

    static async create(): Promise<Room | undefined>{
        const ONE_MINUTE= 60_000;
        let room: Room;

        const release = await this.mutex.acquire();
        try {
            if (this.roomIds.length === 0) {
                release();
                return;
            }

            room = new Room(this.roomIds.shift()!, [], setInterval(() => {
                if (room.users.length == 0) {
                    room.close();
                    this.rooms.splice(this.rooms.findIndex(roomToRemove => roomToRemove.id === room.id),
                        1);
                    this.roomIds.push(room.id);
                    this.roomIds.sort();
                    clearInterval(room.timeout);
                }
            }, ONE_MINUTE));
        } finally {
            release();
        }

        this.rooms.push(room);
        return room;
    }
}