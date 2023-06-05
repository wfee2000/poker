import {User} from "./user";
import {WebSocket} from "ws";

export class UserRepository {
    static loggedInUsers: User[] = [];

    static login(id: number, name: string): boolean {
        if (this.get(id)) {
            return false;
        }

        this.loggedInUsers.push(new User(id, name, null));
        return true;
    }

    static get(id: number): User | undefined {
        return this.loggedInUsers.find((user: User) => user.id == id);
    }

    static connectTo(id: number, ws: WebSocket): boolean {
        let user = this.get(id);

        if (!user || user.ws !== null) {
            return false;
        }

        user.ws = ws;
        return true;
    }
}