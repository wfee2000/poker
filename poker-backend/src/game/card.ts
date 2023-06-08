import {cartesian} from "../utils";
import {Player} from "./player";

export enum CardColor {
    SPADE = "♠",
    HEART = "♥",
    CLOVER = "♣",
    DIAMOND = "♦",
}

export const CardValues = [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11, // "J"
    12, // "Q"
    13, // "K"
    14 // "A"
] as const;

export type CardValue = (typeof CardValues)[number];
export type Card = [CardColor, CardValue];

// TODO: dk if the map is really needed...
export const Deck: Card[] = cartesian(Object.values(CardColor), CardValues).map(o => [o[0], o[1]] as Card);

export class PokerEvaluate {
    public static evalWinners(players: Player[]): Player[] {
        return [];
    }
}