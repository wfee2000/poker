import {cartesian} from "../utils";
import {Player} from "./player";
import * as querystring from "querystring";

export enum PokerHand {
    ROYAL_FLUSH,
    STRAIGHT_FLUSH,
    FOUR_OF_A_KIND,
    FULL_HOUSE,
    FLUSH,
    STRAIGHT,
    THREE_OF_A_KIND,
    TWO_PAIR,
    PAIR,
    HIGH_CARD
}

export enum CardColor {
    SPADE = "♠",
    HEART = "♥",
    CLOVER = "♣",
    DIAMOND = "♦"
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
    public static evalWinners(players: Player[], communityCards: Card[]): Player[] {
        let evaluation: Map<string, [PokerHand, number][]> = new Map<string, [PokerHand, number][]>();

        for (let pl of players) {


            evaluation.set(pl.name, this.evalCards(pl.cards.concat(communityCards)));
        }

        // TODO compare evals and find winner

        return [];
    }

    private static evalCards(cards: Card[]): [PokerHand, number][] {
        cards.sort((c1, c2) => c1[1] - c2[1]);

        let groupedCards: CardColor[][] = Array(15);

        for (let i = 0; i < groupedCards.length; i++) {
            groupedCards[i] = [];
        }

        for (let i = 0; i < cards.length; i++) {
            groupedCards[cards[i][1]].push(cards[i][0]);
        }

        console.log(this.hasStraightFlush(groupedCards));

        return [];
    }

    private static hasRoyalFlush(cards: CardColor[][]): boolean {
        if (cards[14].length === 0) {
            return false;
        }

        let colors: CardColor[] = cards[14];

        for (let i = cards.length - 2; i >= 10; i--) {
            let acf: boolean = false;

            for (let cc of cards[i]) {
                acf ||= colors.includes(cc);
            }

            colors = colors.filter(c => cards[i].includes(c));

            if (!acf) {
                return false;
            }
        }

        return true;
    }

    private static hasStraightFlush(cards: CardColor[][]): [boolean, number] {
        let colors: CardColor[] = cards[13];
        let consecutiveCardCount: number = cards[13].length === 0 ? 0 : 1;
        let biggestNum: number = 13;

        for (let i = cards.length - 3; i >= 2; i--) {
            if (cards[i].length !== 0) {
                if (consecutiveCardCount === 0) {
                    console.log(i);
                    biggestNum = i;
                    colors = cards[i];
                }

                if (cards[i + 1].length !== 0) {
                    let acf: boolean = false;

                    for (let cc of cards[i]) {
                        acf ||= colors.includes(cc);
                    }

                    if (!acf) {
                        consecutiveCardCount = 1;
                    } else {
                        consecutiveCardCount++;
                        colors = colors.filter(c => cards[i].includes(c));

                        if (consecutiveCardCount === 5) {
                            break;
                        }
                    }
                } else {
                    consecutiveCardCount = 1;
                }
            } else {
                consecutiveCardCount = 0;
            }
        }

        return [consecutiveCardCount === 5, biggestNum];
    }

    private static hasFourOfAKind(cards: CardColor[][]): [boolean, number] {
        for (let i = cards.length - 1; i >= 2; i--) {
            if (cards[i].length === 4) {
                return [true, i];
            }
        }

        return [false, 0];
    }

    private static hasFlush(cards: CardColor[][]): boolean {
        let cardColor: Map<CardColor, number> = new Map<CardColor, number>();
        cardColor.set(CardColor.HEART, 0);
        cardColor.set(CardColor.CLOVER, 0);
        cardColor.set(CardColor.DIAMOND, 0);
        cardColor.set(CardColor.SPADE, 0);

        for (let i = cards.length - 1; i >= 2; i--) {
            if (cards[i]) {
                cards[i].forEach(color => cardColor.set(color, cardColor.get(color)! + 1));

                for (let count of cardColor.values()) {
                    if (count === 5) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private static hasStraight(cards: CardColor[][]): [boolean, number] {
        let consecutiveCardCount: number = cards[13].length === 0 ? 0 : 1;
        let biggestNum: number = 13;

        for (let i = cards.length - 3; i >= 2; i--) {
            if (cards[i].length !== 0) {
                if (consecutiveCardCount === 0) {
                    console.log(i);
                    biggestNum = i;
                }

                if (cards[i + 1].length !== 0) {
                    consecutiveCardCount++;

                    if (consecutiveCardCount === 5) {
                        break;
                    }
                } else {
                    consecutiveCardCount = 1;
                }
            } else {
                consecutiveCardCount = 0;
            }
        }

        return [consecutiveCardCount === 5, biggestNum];
    }

    private static hasThreeOfAKind(cards: CardColor[][]): [boolean, number] {
        for (let i = cards.length - 1; i >= 2; i--) {
            if (cards[i].length === 3) {
                return [true, i];
            }
        }

        return [false, 0];
    }

    private static hasTwoOfPair(cards: CardColor[][]): [boolean, number, number] {
        let cardValue: number[] = [];
        return [cards.filter((cardValues, i) => {
            if (cardValues.length === 2) {
                cardValue.push(i);
                return true;
            }

            return false;
        }).length === 2, cardValue[0], cardValue[1]];
    }

    private static hasPair(cards: CardColor[][]): [boolean, number] {
        for (let i = cards.length - 1; i >= 2; i--) {
            if (cards[i].length === 2) {
                return [true, i];
            }
        }

        return [false, 0];
    }

    private static highestCard(cards: CardColor[][]): number {
        for (let i = cards.length - 1; i >= 2; i--) {
            if (cards[i].length !== 0) {
                return i;
            }
        }

        return 0;
    }

    /*private static evalCards(cards: Card[]): [PokerHand, number][] {
        cards.sort((c1, c2) => c1[1] - c2[1]);

        let lastVal: number = cards[0][1];
        let lastCol: string = cards[0][0];

        let valEqStreak: number = 0;
        let valIncStreak: number = 0;

        let colFreqs: Map<string, number> = new Map<string, number>();

        let pairs: number[] = [];
        let toaks: number[] = [];
        let foaks: number[] = [];
        let straights: number[] = [];
        let flushColors: string[] = [];

        for (let i: number = 1; i < cards.length; i++) {
            let currVal = cards[i][1];
            let currCol = cards[i][0]

            valEqStreak = currVal === lastVal ? valEqStreak + 1 : 0;
            valIncStreak = currVal === lastVal + 1 ? valIncStreak + 1 : 0;

            switch (valEqStreak) {
                case 1:
                    pairs.push(i - 1);
                    break;
                case 2:
                    // TODO: filtering once after completion might be more performant
                    pairs = pairs.filter(p => p !== i - 3);
                    toaks.push(i - 2);
                    break;
                case 3:
                    toaks = toaks.filter(t => t !== i - 4);
                    foaks.push(i - 3);
                    break;
            }

            if (valIncStreak >= 4) {
                straights.push(i - 4);
            }

            colFreqs.set(currCol, (colFreqs.get(currCol) ?? 0) + 1);

            lastVal = currVal;
            lastCol = currCol;
        }

        colFreqs.forEach((val, key) => {
            if (val >= 5) {
                flushColors.push(key);
            }
        });

        console.log(cards);
        console.log(pairs);
        console.log(toaks);
        console.log(foaks)
        console.log(straights);
        console.log(flushColors);

        let res: [PokerHand, number][] = [];

        // Primary
        // Royal flush. Magic number 14: value of ace, 4 offset from first card of straight to last
        if (straights.some(s => cards[s + 4][1] === 14 && cards.slice(s, s + 5).every(c => c[0] == cards[s][0]))) {
            console.log("rf");
            res.push([PokerHand.ROYAL_FLUSH, 14]);
        } else if (straights.some(s => cards.slice(s, s + 5).every(c => c[0] == cards[s][0]))) { // Straight flush
            console.log("sf");
            res.push([PokerHand.STRAIGHT_FLUSH, straights.filter(s => cards.slice(s, s + 5).every(c => c[0] == cards[s][0])).sort((s1, s2) => cards[s2 + 4][1] - cards[s1 + 4][1] )[0]]);
        }

        console.log(res);

        return res;
    }*/
}