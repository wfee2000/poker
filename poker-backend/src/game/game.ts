import {Player} from "./player";

export class Game {
    private readonly mBigBlind: number;
    private readonly mSmallBlind: number;
    private readonly mStartBalance: number;
    private mPlayers: Player[];

    public constructor(bigBlind: number = 10,
                       smallBlind: number = bigBlind / 2,
                       startBalance: number = bigBlind * 100) {
        this.mBigBlind = bigBlind;
        this.mSmallBlind = smallBlind;
        this.mStartBalance = startBalance;
        this.mPlayers = [];
    }

    public addPlayer(name: string): boolean {
        if (this.mPlayers.some(p => p.name === name)){
            return false;
        }

        this.mPlayers.push(new Player(name, this.mStartBalance));
        return true;
    }

    public get bigBlind(): number {
        return this.mBigBlind;
    }

    public get smallBlind(): number {
        return this.mSmallBlind;
    }

    public get startBalance(): number {
        return this.mStartBalance;
    }
}