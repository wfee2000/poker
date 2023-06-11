import {User} from "./user";
import {WebSocket} from "ws";
import {Mutex} from "async-mutex";

export class UserRepository {
    static loggedInUsers: User[] = [];
    static mutex: Mutex = new Mutex();

    static logout(id: number): boolean {
        let user = this.get(id);
        if (!user || user.ws || user.currentRoom) {
            return false;
        }

        this.loggedInUsers.splice(this.loggedInUsers.findIndex(user => user.id === id));
        return true;
    }

    static login(id: number, name: string): boolean {
        if (this.get(id)) {
            return false;
        }

        this.loggedInUsers.push(new User(id, name));
        return true;
    }

    static get(id: number): User | undefined;
    static get (predicate: (user: User) => boolean): User | undefined;

    static get (param: number | ((user: User) => boolean)): User | undefined {
        if (typeof param === "number") {
            return this.get((user: User) => user.id === param);
        }

        return this.loggedInUsers.find(param);
    }

    static async connectTo(id: number, ws: WebSocket): Promise<boolean> {
        let user = this.get(id);

        const release = await this.mutex.acquire();

        try {
            if (!user || user.ws !== null) {
                release();
                
                return false;
            }

            user.ws = ws;
        } finally {
            release();
        }

        return true;
    }
}