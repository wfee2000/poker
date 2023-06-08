import {Card} from "./card";

export type GameActionResult = [boolean, string | null];
export type GameEventCallback = (ct: CallbackType,
                                 nxt: () => void,
                                 data: GameMessage) => void;
export type BetAction = "raise" | "call" | "check" | "fold";
export enum CallbackType {
    CLIENT_CONFIRM, // Send event and data to specific client and wait for confirmation of delivery
    SPECIFIC_CLIENT_WITH_RESULT, // Send event and data to specific client and wait for a valid result
    BROADCAST_CONFIRM, // Send event and data to all clients and wait for confirmation of delivery
}

export enum GameEvent {
    START_OK, // Sent after the start function is called and completed sucessfully
    DISTRIBUTE_HAND, // Sent to specific player after hand was generated
    BET_REQUEST, // Sent to specific player telling him to bet
    BET_COMPLETE, // Sent to all players when a player has completed a bet
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
    recipient: string | null; // String if specific player, null on broadcast
    gameEvent: GameEvent;
    content: any;
}

export interface GameStartMessage extends GameMessage {
    recipient: null;
    content: PlayerUpdate[];
}

export interface PlayerUpdate {
    name: string;
    balance: number;
}

export interface DistributeHandMessage extends GameMessage {
    recipient: string;
    content: Card[];
}

export interface BetRequestMessage extends GameMessage {
    recipient: string;
    content: null;
}

export interface BetResponseMessage {
    action: BetAction;
    amount: number | null;
}

export function isValidBetResponseMessage(arg: any): arg is BetResponseMessage {
    return arg && arg.action && typeof arg.action === "string" && "raise" in arg.action && "call" in arg.action
        && "check" in arg.action && "fold" in arg.action
        && ((typeof arg.amount === "number" && arg.amount > 0)|| arg.amount === null)
        && (!(arg.action === "raise" && arg.amount === null));
}

export interface BetCompleteMessage extends GameMessage {
    recipient: null; // broadcast
    content: {
        name: string;
        action: BetAction;
        amount: number | null;
    };
}