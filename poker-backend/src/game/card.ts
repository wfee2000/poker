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
        let evaluation: Map<Player, [PokerHand, number[]][]> = new Map<Player, [PokerHand, number[]][]>();

        for (let pl of players) {
            let cards: Card[] = pl.cards.concat(communityCards);
            let primary: [PokerHand, number[]] = this.evalCards(cards);

            for (let num of primary[1]) {
                cards.splice(cards.findIndex(c => c[1] === num), 1);
            }

            let remainingPlayerCards = pl.cards.filter(c => cards.includes(c));

            let secondary: [PokerHand, number[]] = this.evalCards(remainingPlayerCards);
            evaluation.set(pl, [primary, secondary]);
        }

        let winners: [Player, [PokerHand, number[]][]][] = [];

        for (let [k, v] of evaluation) {
            if (winners.length === 0) {
                
                winners.push([k, v]);
            } else {
                
                let cmp = this.compareEvals(winners[0][1], v);
                

                if (cmp < 0) { // current won
                    winners.length = 0;
                    winners.push([k,v]);
                } else if (cmp === 0) { // tie
                    winners.push([k,v]);
                } // cmp > 0: other won. do nothing
            }
        }

        return winners.map(w => w[0]);
    }

    // 0: equal, >= 1: first won, <= -1: second won
    private static compareEvals(first: [PokerHand, number[]][], second: [PokerHand, number[]][]): number {
        let cmp = second[0][0] - first[0][0];

        if (cmp === 0) {
            cmp = Math.max(...first[0][1]) - Math.max(...second[0][1]);

            if (cmp === 0) {
                cmp = second[1][0] - first[1][0];

                if (cmp === 0) {
                    cmp = Math.max(...first[1][1]) - Math.max(...second[1][1]);
                }
            }
        }

        return cmp;
    }

    private static evalCards(cards: Card[]): [PokerHand, number[]] {
        cards.sort((c1, c2) => c1[1] - c2[1]);

        let groups: CardColor[][] = Array(15);

        for (let i = 0; i < groups.length; i++) {
            groups[i] = [];
        }

        for (let i = 0; i < cards.length; i++) {
            groups[cards[i][1]].push(cards[i][0]);
        }

        let consecutiveValStreak: number = 0;

        let pairs: number[] = [];
        let toak: number[] = [];
        let foak: number[] = [];
        let straights: number[][] = [];
        let flush: number[] | null = null;
        let straightFlushes: number[][] = [];
        let highCard: number = 0;
        let colFrequencies: Map<CardColor, number[]> = new Map<CardColor, number[]>();

        let lastCols: CardColor[] = groups[2];

        for (let i = 3; i < groups.length; i++){
            let curCols: CardColor[] = groups[i];

            consecutiveValStreak = lastCols.length >= 1 && curCols.length >= 1 ? consecutiveValStreak + 1 : 0;

            switch (curCols.length) {
                case 2:
                    pairs.push(i);
                    break;
                case 3:
                    toak.push(i);
                    break;
                case 4:
                    foak.push(i);
                    break;
            }

            if (consecutiveValStreak >= 4) {
                straights.push(Array.from( { length: 5 }, (_, idx) => (i - 4) + idx));

                // Possibility of straight flush
                let colors: CardColor[][] = groups.slice(i - 4, i + 1).map(c => [... new Set(c)]);
                let results: CardColor[] = colors.reduce((a, b) => a.filter(c => b.includes(c)));

                for (let res of results) {
                    straightFlushes.push(Array.from( { length: 5 }, (_, idx) => (i - 4) + idx));
                }
            }

            for (let col of curCols) {
                let arr = (colFrequencies.get(col) ?? []);
                arr.push(i);
                colFrequencies.set(col, arr);
            }

            if (curCols.length !== 0) {
                highCard = i;
            }

            lastCols = curCols;
        }

        // Note: for 7 cards there can only be 1 flush so this should be fine
        for (let [_,v] of colFrequencies.entries()) {
            if (v.length >= 5) {
                flush = v;
            }
        }

        // Sort everything: They should tecnically already be in ascending order but i want descending (:
        pairs.sort((a, b) => b - a);
        toak.sort((a, b) => b - a);
        foak.sort((a, b) => b - a);
        straights.sort((s1, s2) => s2[s2.length - 1] - s1[s1.length - 1]);
        straightFlushes.sort((s1, s2) => s2[s2.length - 1] - s1[s1.length - 1]);

        let hand: [PokerHand, number[]] = [PokerHand.HIGH_CARD, [highCard]];
        let nums: number[] | undefined;

        if ((nums = straightFlushes.find(sf => sf[sf.length - 1] === 14))) {
            hand = [PokerHand.ROYAL_FLUSH, nums];
        } else if (straightFlushes.length !== 0) {
            hand = [PokerHand.STRAIGHT_FLUSH, straightFlushes[0]];
        } else if (foak.length !== 0) {
            hand = [PokerHand.FOUR_OF_A_KIND, Array(4).fill(foak[0])];
        } else if (toak.length >= 1 && pairs.length >= 1) {
            hand = [PokerHand.FULL_HOUSE, Array(3).fill(toak[0]).concat(Array(2).fill(pairs[0]))];
        } else if (flush !== null) {
            let bestCard = Math.max(...flush);
            flush.sort((a,b) => a - b);
            let rem: number[] = flush.slice(0, 4);
            hand = [PokerHand.FLUSH, [bestCard, ...rem]];
        } else if (straights.length !== 0) {
            hand = [PokerHand.STRAIGHT, straights[0]];
        } else if (toak.length >= 1) {
            hand = [PokerHand.THREE_OF_A_KIND, Array(3).fill(toak[0])];
        } else if (pairs.length >= 2) {
            hand = [PokerHand.TWO_PAIR, Array(2).fill(pairs[0]).concat(Array(2).fill(pairs[1]))];
        } else if (pairs.length === 1) {
            hand = [PokerHand.PAIR, Array(2).fill(pairs[0])];
        }

        return hand;
    }
}