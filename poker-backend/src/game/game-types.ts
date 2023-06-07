import {Card} from "./card";

export type GameActionResult = [boolean, string | null];
export type GameEventCallback = (ct: CallbackType,
                                 nxt: () => void,
                                 data: GameMessage) => void;
export enum CallbackType {
    CLIENT_CONFIRM, // Send event and data to specific client and wait for confirmation of delivery
    SPECIFIC_CLIENT_WITH_RESULT, // Send event and data to specific client and wait for a valid result
    BROADCAST_CONFIRM, // Send event and data to all clients and wait for confirmation of delivery
}

export enum GameEvent {
    START_OK, // Sent after the start function is called and completed sucessfully
    DISTRIBUTE_HAND, // Sent to specific player after hand was generated
}

export enum GameState {
    WAITING_FOR_PLAYERS, // Wait for players to join
    DISTRIBUTE_CARDS, // Give cards to players
    PREFLOP_BET, // Bet before revealing any cards
    FLOP, // Unveil 3 community cards
    TURN_BET, // Bet before revealing 4th community card
    TURN, // Unveil 4th community card
    RIVER_BET, // Bet before 5th community card is revealed
    RIVER, // Unveil 5th community card
    SHOWDOWN_BET, // Last bet before showdown
    SHOWDOWN, // Every player shows their cards
    CLEANUP, // Ask every player if they want to continue playing or leave the room
}

export interface GameMessage {
    recipient: string | null, // String if specific player, null on broadcast
    gameEvent: GameEvent,
    content: any
}

export interface DistributeHandMessage extends GameMessage {
    content: Card[]
}