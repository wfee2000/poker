export class Player {
    // mostly TODO
    private readonly mName: string;
    private mBalance: number;

    public constructor(name: string, startBalance: number) {
        this.mName = name;
        this.mBalance = startBalance;
    }

    public get name() {
        return this.mName;
    }
}