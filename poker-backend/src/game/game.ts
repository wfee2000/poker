import {Player} from "./player";
import {rndInt} from "../utils";
import {Card, Deck} from "./card";
import {
    BetCompleteMessage,
    BetRequestMessage,
    CallbackType,
    DistributeHandMessage,
    GameActionResult,
    GameEvent,
    GameEventCallback,
    GameStartMessage,
    GameState,
    isValidBetResponseMessage,
    PlayerUpdate
} from "./game-types";
import {DistributeCardsData} from "./state-data/DistributeCardsData";
import {BetData} from "./state-data/BetData";

export class Game {
    private static readonly MIN_PLAYERS: number = 2;

    private readonly mBigBlind: number;
    private readonly mSmallBlind: number;
    private readonly mStartBalance: number;
    private readonly mAvailableCards: Card[];
    private readonly mGameEventCallback: GameEventCallback;

    // State data
    private readonly mDistributeCardsData: DistributeCardsData;
    private readonly mBetData: BetData;

    private mCurrentState: GameState;
    private mPlayers: Player[];
    private mDealer: number;

    public constructor(eventCallback: GameEventCallback,
                       bigBlind: number = 10,
                       smallBlind: number = bigBlind / 2,
                       startBalance: number = bigBlind * 100) {
        this.mBigBlind = bigBlind;
        this.mSmallBlind = smallBlind;
        this.mStartBalance = startBalance;
        this.mGameEventCallback = eventCallback;
        this.mPlayers = [];
        this.mDealer = 0;
        this.mAvailableCards = Deck.slice(0, Deck.length);
        this.mCurrentState = GameState.WAITING_FOR_PLAYERS;

        this.mDistributeCardsData = new DistributeCardsData();
        this.mBetData = new BetData();
    }

    // region Helpers
    private wasined(num: number, len: number): number[] {
        let kekos: number[] = [];

        for (let i = num; i < num + len; i++) {
            kekos.push(i % len);
        }

        return kekos;
    }
    // endregion

    // region State management
    private update(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                // No update for w4p... Do nothing.
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.distributeCards();
                break;
            case GameState.PREFLOP_BET:
                this.preflopBet();
                break;
            case GameState.FLOP:
                // TODO
                break;
            default:
                console.error(`Unknown game state!: ${GameState[this.mCurrentState]}`)
                break;
        }
    }

    private advanceState(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                this.mDistributeCardsData.currentPlayerIndex = 0;
                this.mCurrentState = GameState.DISTRIBUTE_CARDS;
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.mBetData.currentPlayerIdx = this.mDealer; // TODO: Proper poker behaviour
                this.mBetData.playersToProcess = this.wasined(this.mDealer, this.mPlayers.length);
                this.mBetData.lastBet = 0;
                this.mCurrentState = GameState.PREFLOP_BET;
                break;
            case GameState.PREFLOP_BET:
                // TODO: do i need anything here?
                this.mCurrentState = GameState.FLOP;
                break;
            case GameState.FLOP:
                this.mCurrentState = GameState.TURN_BET;
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

        // Choose random player as dealer
        this.mDealer = rndInt(0, this.mPlayers.length - 1);

        // --> Distribute cards
        this.advanceState();

        this.mGameEventCallback(CallbackType.BROADCAST_CONFIRM, this.update, {
            recipient: null,
            gameEvent: GameEvent.START_OK,
            content: this.mPlayers.map(p => {
                return { name: p.name, balance: p.balance } as PlayerUpdate
            }),
        } as GameStartMessage);

        return [true, null];
    }

    // endregion

    // region State: Distribute cards
    private distributeCards(): void {
        if (this.mCurrentState !== GameState.DISTRIBUTE_CARDS) {
            console.error("Bug: distribute cards called in wrong state!");
            return; // Refuse
        }

        let player: Player = this.mPlayers[this.mDistributeCardsData.currentPlayerIndex];
        let cards: Card[] = [];

        for (let i: number = 0; i < Player.CARD_COUNT; i++) {
            cards.push(this.mAvailableCards.splice(rndInt(0, this.mAvailableCards.length - 1), 1)[0]);
        }

        player.cards = cards;
        this.mDistributeCardsData.currentPlayerIndex++;

        if (this.mDistributeCardsData.currentPlayerIndex === this.mPlayers.length) {
            // distributing cards done... --> Start first betting phase
            this.advanceState();
        }

        this.mGameEventCallback(CallbackType.CLIENT_CONFIRM, this.update, {
            recipient: player.name,
            gameEvent: GameEvent.DISTRIBUTE_HAND,
            content: player.cards
        } as DistributeHandMessage);
    }

    // endregion

    // region State: Preflop bet
    private preflopBet(): void {
        if (this.mCurrentState !== GameState.PREFLOP_BET) {
            console.error("Bug: preflop bet called in wrong state!");
            return; // Refuse
        }

        if (this.mBetData.remainingPlayers === 1) {
            this.advanceState(); // --> Flop
        }

        let res: number = this.mBetData.processNext()!;

        // If the player is has folded call update to prevent losing context
        if (!this.mPlayers[res].isActive) {
            this.update();
        } else {
            this.mGameEventCallback(CallbackType.SPECIFIC_CLIENT_WITH_RESULT, () => {}, {
                recipient: this.mPlayers[this.mBetData.currentPlayerIdx].name,
                gameEvent: GameEvent.BET_REQUEST,
                content: null
            } as BetRequestMessage);
        }
    }
    // endregion

    // region Betting
    public bet(msg: any): GameActionResult {
        if (this.mCurrentState !== GameState.PREFLOP_BET && this.mCurrentState !== GameState.TURN_BET
            && this.mCurrentState !== GameState.RIVER_BET && this.mCurrentState !== GameState.SHOWDOWN_BET) {
            console.error("Possible bug: bet called in wrong state!");
            return [false, `Can not run bet now! Invalid state for bet ${GameState[this.mCurrentState]}`];
        }

        if (!isValidBetResponseMessage(msg)){
            return [false, "Invalid bet message!"];
        }

        // Note: player should always be current when this method is called and should not have folded already

        // TODO: Implement proper betting
        let pl: Player = this.mPlayers[this.mBetData.currentPlayerIdx];
        let bd: BetData = this.mBetData;

        switch (msg.action) {
            case "raise":
                if (!pl.canAfford(bd.lastBet + msg.amount!)) {
                    return [false, "You can not bet more than your current balance"];
                }

                pl.balance -= bd.lastBet + msg.amount!;
                bd.lastBet += msg.amount!;
                break;
            case "call":
                if (!pl.canAfford(bd.lastBet)) {
                    return [false, "You can not bet more than your current balance"];
                }

                pl.balance -= bd.lastBet
                break;
            case "check":
                if (bd.lastBet !== 0) {
                    return [false, "You can not check if there is money on the line"];
                }
                break;
            case "fold":
                // TODO: What if everyone folds?
                pl.isActive = false;
                break;
            default:
                return [false, "Invalid bet operation"];
        }

        this.mGameEventCallback(CallbackType.BROADCAST_CONFIRM, this.update, {
            gameEvent: GameEvent.BET_COMPLETE,
            content: {
                name: pl.name,
                action: msg.action,
                amount: msg.amount,
            }
        } as BetCompleteMessage);

        return [true, null];
    }
    // endregion

    // region State: Flop
    private flop(): void {
        if (this.mCurrentState !== GameState.FLOP) {
            console.error("Bug: flop called in wrong state!");
            return; // Refuse
        }

        // Pseudo
        // 1. choose 3 random cards
        // 2. broadcast cards
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