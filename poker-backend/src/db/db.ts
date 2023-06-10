import {open, Database, Statement} from "sqlite";
import {Database as Driver} from "sqlite3";

const dbFileName: string = "poker.db";

export class DB {
    public static async createDBConnection(): Promise<Database> {
        const db = await open({
            filename: `./${dbFileName}`,
            driver: Driver
        });

        await DB.ensureTablesCreated(db);

        return db;
    }

    public static async beginTransaction(connection: Database): Promise<void> {
        await connection.run('begin transaction;');
    }

    public static async commitTransaction(connection: Database): Promise<void> {
        await connection.run('commit;');
    }

    public static async rollbackTransaction(connection: Database): Promise<void> {
        await connection.run('rollback;');
    }

    private static async ensureTablesCreated(connection: Database): Promise<void> {
        await connection.run(
            `CREATE TABLE IF NOT EXISTS USER (
                    id integer primary key,
                    name text not null,
                    password text not null,
                    deposit integer not null
                ) strict;`
        );
    }
}
