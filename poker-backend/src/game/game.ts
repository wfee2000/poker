import {Player} from "./player";
import {GameActionResult, GameState} from "./game-state";
import {GameEvent} from "./game-event";
import {rndInt} from "../utils";
import {Card, Deck} from "./card";
import {CallbackType} from "./callback-type";

export class Game {
    private static readonly MIN_PLAYERS: number = 2;

    private readonly mBigBlind: number;
    private readonly mSmallBlind: number;
    private readonly mStartBalance: number;
    private readonly mGameEventCallback: (ev: GameEvent,
                                          ct: CallbackType,
                                          nxt: () => void,
                                          data: any) => void;

    private mCurrentState: GameState;
    private mPlayers: Player[];
    private mCurrentPlayer: number;
    private mAvailableCards: Card[];

    public constructor(eventCallback: (ev: GameEvent,
                                       ct: CallbackType,
                                       nxt: () => void,
                                       data: any) => void,
                       bigBlind: number = 10,
                       smallBlind: number = bigBlind / 2,
                       startBalance: number = bigBlind * 100) {
        this.mBigBlind = bigBlind;
        this.mSmallBlind = smallBlind;
        this.mStartBalance = startBalance;
        this.mGameEventCallback = eventCallback;
        this.mPlayers = [];
        this.mCurrentPlayer = 0;
        this.mAvailableCards = Deck.slice(0, Deck.length);

        this.mCurrentState = GameState.WAITING_FOR_PLAYERS;
    }

    // region State management
    private next(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                // Nothing to do
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.distributeCards();
                break;
            case GameState.PREFLOP_BET:
                break;
            case GameState.FLOP:
                break;
            case GameState.TURN_BET:
                break;
            case GameState.TURN:
                break;
            case GameState.RIVER_BET:
                break;
            case GameState.RIVER:
                break;
            case GameState.SHOWDOWN_BET:
                break;
            case GameState.SHOWDOWN:
                break;
            case GameState.CLEANUP:
                break;
            default:
                console.error(`Unknown state!: ${this.mCurrentState}`);
                break;
        }
    }
    // endregion

    // region State: Waiting for players
    public addPlayer(name: string): GameActionResult {
        if (this.mCurrentState !== GameState.WAITING_FOR_PLAYERS) {
            return [false, "A new player can not be added! The game has already started."];
        }

        if (this.mPlayers.some(p => p.name === name)) {
            return [false, "Username already taken"];
        }

        this.mPlayers.push(new Player(name, this.mStartBalance));
        return [true, null];
    }

    public removePlayer(name: string): GameActionResult {
        if (this.mCurrentState !== GameState.WAITING_FOR_PLAYERS) {
            return [false, "A player can not be removed! The game has already started."];
        }

        // TODO: Check if player exists?

        this.mPlayers = this.mPlayers.filter(p => p.name === name);
        return [true, null];
    }

    public start(): GameActionResult {
        if (this.mCurrentState !== GameState.WAITING_FOR_PLAYERS) {
            return [false, "The game can not be started now!"];
        }

        if (this.mPlayers.length < Game.MIN_PLAYERS) {
            return [false, "Not enough players to start now!"];
        }

        // Choose random player as current
        this.mCurrentPlayer = rndInt(0, this.mPlayers.length - 1);

        // Change state
        this.mCurrentState = GameState.DISTRIBUTE_CARDS;

        // Send event START_OK
        this.mGameEventCallback(GameEvent.START_OK,
                                CallbackType.BROADCAST_CONFIRM,
                                this.next,
                            null);

        return [true, null];
    }

    // endregion

    // region State: distribute cards
    private distributeCards(): void {
        if (this.mCurrentState !== GameState.DISTRIBUTE_CARDS) {
            console.error(`Error: Invalid Game state ${GameState[this.mCurrentState]} for distribute cards`);
            return; // Refuse
        }


    }
    // endregion

    // region Getters and Setters
    public get bigBlind(): number {
        return this.mBigBlind;
    }

    public get smallBlind(): number {
        return this.mSmallBlind;
    }

    public get startBalance(): number {
        return this.mStartBalance;
    }

    // TODO: remove
    public get players() {
        return this.mPlayers;
    }
    // endregion
}


/*
Ded shit:
// region Helpers

    // endregion
    private preparePreflopBet(): void {
        // BET_NEXT ->
    }
    for (let player of this.mPlayers) {
            let cards: Card[] = [];

            for (let i: number = 0; i < Player.CARD_COUNT; i++) {
                cards.push(this.mAvailableCards.splice(rndInt(0, this.mAvailableCards.length - 1), 1)[0]);
            }

            player.cards = cards;
        }

        //this.mGameEventCallback(GameEvent.DISTRIBUTE_OK);
        this.advanceState(); // -> Preflop bet

// region State: Distribute Cards
    private distributeCards(): void {

    }
    // endregion

    // region State: Preflop Bet

    // endregion

    // region State: Flop
    // endregion

    // region State: Turn Bet
    // endregion

    // region State: Turn
    // endregion

    // region State: River Bet
    // endregion

    // region State: River
    // endregion

    // region State: Showdown Bet
    // endregion

    // region State: Showdown
    // endregion

    // region State: Cleanup
    // endregion


*/