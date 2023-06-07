import {cartesian} from "../utils";

export enum CardColor {
    SPADE = "♠",
    HEART = "♥",
    CLOVER = "♣",
    DIAMOND = "♦",
}

export const CardValues = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
] as const;

export type CardValue = (typeof CardValues)[number];
export type Card = [CardColor, CardValue];

// TODO: dk if the map is really needed...
export const Deck: Card[] = cartesian(Object.values(CardColor), CardValues).map(o => [o[0], o[1]]);