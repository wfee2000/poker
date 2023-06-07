import {Player} from "./player";
import {rndInt} from "../utils";
import {Card, Deck} from "./card";
import {
    CallbackType,
    DistributeHandMessage,
    GameActionResult,
    GameEvent,
    GameEventCallback,
    GameState
} from "./game-types";
import {DistributeCardsData} from "./state-data/DistributeCardsData";

export class Game {
    private static readonly MIN_PLAYERS: number = 2;

    private readonly mBigBlind: number;
    private readonly mSmallBlind: number;
    private readonly mStartBalance: number;
    private readonly mAvailableCards: Card[];
    private readonly mGameEventCallback: GameEventCallback;

    // State data
    private readonly mDistributeCardsData: DistributeCardsData;

    private mCurrentState: GameState;
    private mPlayers: Player[];
    private mCurrentActivePlayer: number;

    public constructor(eventCallback: GameEventCallback,
                       bigBlind: number = 10,
                       smallBlind: number = bigBlind / 2,
                       startBalance: number = bigBlind * 100) {
        this.mBigBlind = bigBlind;
        this.mSmallBlind = smallBlind;
        this.mStartBalance = startBalance;
        this.mGameEventCallback = eventCallback;
        this.mPlayers = [];
        this.mCurrentActivePlayer = 0;
        this.mAvailableCards = Deck.slice(0, Deck.length);

        this.mCurrentState = GameState.WAITING_FOR_PLAYERS;

        this.mDistributeCardsData = new DistributeCardsData();
    }

    // region State management
    private update(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                // Do nothing
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.distributeCards();
                break;
            default:
                console.error(`Unknown game state!: ${GameState[this.mCurrentState]}`)
                break;
        }
    }
    private advanceState(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                this.mCurrentState = GameState.DISTRIBUTE_CARDS;
                break;
            default:
                console.error(`Unknown game state!: ${GameState[this.mCurrentState]}`)
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
        this.mCurrentActivePlayer = rndInt(0, this.mPlayers.length - 1);

        // --> Distribute cards
        this.advanceState();

        // Send event START_OK
        this.mGameEventCallback(CallbackType.BROADCAST_CONFIRM, this.update, {
            recipient: null,
            gameEvent: GameEvent.START_OK,
            content: null
        });

        return [true, null];
    }
    // endregion

    // region State: distribute cards
    private distributeCards(): void {
        if (this.mCurrentState !== GameState.DISTRIBUTE_CARDS) {
            console.error("Bug: distribute cards called in wrong state!");
            return; // Refuse
        }

        if (this.mDistributeCardsData.currentPlayerIndex === this.mPlayers.length - 1) {
            // distributing cards done... --> Start first betting phase
            this.advanceState();
            return;
        }

        let player: Player = this.mPlayers[this.mDistributeCardsData.currentPlayerIndex];
        let cards: Card[] = [];

        for(let i: number = 0; i < Player.CARD_COUNT; i++) {
            cards.push(this.mAvailableCards.splice(rndInt(0, this.mAvailableCards.length - 1), 1)[0]);
        }

        player.cards = cards;
        this.mDistributeCardsData.currentPlayerIndex++;

        this.mGameEventCallback(CallbackType.CLIENT_CONFIRM, this.update, {
            recipient: player.name,
            gameEvent: GameEvent.DISTRIBUTE_HAND,
            content: player.cards
        } as DistributeHandMessage);
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