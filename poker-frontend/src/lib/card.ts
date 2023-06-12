export const enum PokerHand {
    HighCard = "High Card",
    Pair = "Pair",
    TwoPair = "Two Pair",
    ThreeOfAKind = "Three of a Kind",
    Straight = "Straight",
    Flush = "Flush",
    FullHouse = "Full House",
    FourOfAKind = "Four of a Kind",
    StraightFlush = "Straight Flush",
    RoyalFlush = "Royal Flush",
}

const suits = ["♠", "♥", "♦", "♣"] as const;
type Suit = typeof suits[number];
const ranks = [
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
] as const;
type Rank = typeof ranks[number];

export type Card = {
    suit : Suit,
    rank : Rank,
}

export const evalCards = (cards : Card[]) : PokerHand => {
    if(isRoyalFlush(cards)) {
        return PokerHand.RoyalFlush;
    } else if(isStraightFlush(cards)) {
        return PokerHand.StraightFlush;
    } else if(isFourOfAKind(cards)) {
        return PokerHand.FourOfAKind;
    } else if(isFullHouse(cards)) {
        return PokerHand.FullHouse;
    } else if(isFlush(cards)) {
        return PokerHand.Flush;
    } else if(isStraight(cards)) {
        return PokerHand.Straight;
    } else if(isThreeOfAKind(cards)) {
        return PokerHand.ThreeOfAKind;
    } else if(isTwoPair(cards)) {
        return PokerHand.TwoPair;
    } else if(isPair(cards)) {
        return PokerHand.Pair;
    } else {
        return PokerHand.HighCard;
    }

}

const isRoyalFlush = (cards : Card[]) : boolean => {
    return isStraightFlush(cards) && cards.some(card => card.rank === 14);
}

const isStraightFlush = (cards : Card[]) : boolean => {
    return isFlush(cards) && isStraight(cards);
}

const isFourOfAKind = (cards : Card[]) : boolean => {
    return cards.some(card => cards.filter(c => c.rank === card.rank).length === 4);
}

const isFullHouse = (cards : Card[]) : boolean => {
    return isThreeOfAKind(cards) && isPair(cards);
}

const isFlush = (cards : Card[]) : boolean => {
    return cards.some(card => cards.filter(c => c.suit === card.suit).length === 5);
}

const isStraight = (cards : Card[]) : boolean => {
    if(cards.length < 5) return false;
    const sortedCards = cards.sort((a, b) => a.rank - b.rank);
  
    // Check if the cards form a straight
    for (let i = 0; i < sortedCards.length - 1; i++) {
      if (sortedCards[i].rank + 1 !== sortedCards[i + 1].rank) {
        return false;
      }
    }
    
    return true;
}

const isThreeOfAKind = (cards : Card[]) : boolean => {
    return cards.some(card => cards.filter(c => c.rank === card.rank).length === 3);
}

const isTwoPair = (cards: Card[]): boolean => {
    const ranks: number[] = [];
    
    for (const card of cards) {
      ranks.push(card.rank);
    }
    
    ranks.sort((a, b) => a - b); // Sort ranks in ascending order
    
    let pairsCount = 0;
    
    for (let i = 0; i < ranks.length - 1; i++) {
      if (ranks[i] === ranks[i + 1]) {
        pairsCount++;
        i++; // Skip the next card in the pair
      }
      
      if (pairsCount === 2) {
        return true; // Found two pairs
      }
    }
    
    return false; // No two pairs found
  }

const isPair = (cards : Card[]) : boolean => {
    return cards.some(card => cards.filter(c => c.rank === card.rank).length === 2);
}