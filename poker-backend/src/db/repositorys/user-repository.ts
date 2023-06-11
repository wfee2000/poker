import {DB} from "../db";
import {Database, Statement} from "sqlite";
import {IUser} from "../model/user";

export class DBUserRepository {
    public static async save(connection: Database, user: IUser): Promise<void> {
        await DB.beginTransaction(connection);
        const sql: string = "INSERT INTO USER (name, password, deposit) VALUES (?1, ?2, ?3)";

        try {
            const statement: Statement = await connection.prepare(sql);
            await statement.run({1: user.name, 2: user.password, 3: user.deposit});
            await statement.finalize();
            await DB.commitTransaction(connection);
        } catch (e) {
            
            await DB.rollbackTransaction(connection);
        }
    }

    public static async confirmLogin(connection: Database, name: string, password: string): Promise<number | boolean> {
        await DB.beginTransaction(connection);
        let id: number | boolean = false;
        const sql: string = "SELECT id FROM USER WHERE name = ?1 AND password = ?2";

        try {
            const statement: Statement = await connection.prepare(sql);
            await statement.bind({1: name, 2: password});
            const result: any | undefined = await statement.get();
            await statement.finalize();

            if (typeof result !== "undefined") {
                id = result.id;
            }

            await DB.commitTransaction(connection);
        } catch (e) {
            
            await DB.rollbackTransaction(connection);
        }

        return id;
    }
}