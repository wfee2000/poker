import {Card} from "./card";

export class Player {
    private static readonly M_CARD_COUNT: number = 2;
    private readonly mName: string;
    private mBalance: number;
    private mCards: Card[];
    private mIsActive: boolean;

    public constructor(name: string, startBalance: number) {
        this.mName = name;
        this.mBalance = startBalance;
        this.mCards = [];
        this.mIsActive = true;
    }

    public canAfford(amount: number): boolean {
        return this.mBalance >= amount;
    }

    public get name(): string {
        return this.mName;
    }

    public get cards(): Card[] {
        return this.mCards;
    }

    public set cards(cards: Card[]) {
        if (cards.length !== Player.M_CARD_COUNT) {
            throw new Error("Can not set cards to an array with a size larger than 2!");
        }

        this.mCards = cards;
    }

    public get balance(): number {
        return this.mBalance;
    }

    public set balance(bal: number) {
        this.mBalance = bal;
    }

    public get isActive(): boolean {
        return this.mIsActive;
    }

    public set isActive(isActive: boolean) {
        this.mIsActive = isActive;
    }

    public static get CARD_COUNT(): number {
        return Player.M_CARD_COUNT;
    }
}