import {Player} from "./player";
import {rndInt} from "../utils";
import {
    BetCompleteMessage,
    BetRequestMessage,
    CallbackType,
    DistributeHandMessage,
    GameActionResult,
    GameEndedMessage,
    GameEvent,
    GameEventCallback,
    GameStartMessage,
    GameState,
    isValidBetResponseMessage,
    PlayerUpdate,
    RevealCommunityCardsMessage,
    ShowdownMessage
} from "./game-types";
import {DistributeCardsData} from "./state-data/DistributeCardsData";
import {BetData} from "./state-data/BetData";
import {Card, Deck, PokerEvaluate} from "./card";
import { Room } from "../web-socket/room/room";

export class Game {
    private static readonly MIN_PLAYERS: number = 2;

    private readonly mBigBlind: number;
    private readonly mSmallBlind: number;
    private readonly mStartBalance: number;
    private readonly mRoom: Room;

    // State data
    private readonly mDistributeCardsData: DistributeCardsData;
    private readonly mBetData: BetData;

    private mCurrentState: GameState;
    private mPlayers: Player[];
    private mDealer: number;
    private mPot: number;
    private mCommunityCards: Card[];
    private mAvailableCards: Card[];

    public constructor(room: Room,
                       bigBlind: number = 10,
                       smallBlind: number = bigBlind / 2,
                       startBalance: number = bigBlind * 100) {
        this.mBigBlind = bigBlind;
        this.mSmallBlind = smallBlind;
        this.mStartBalance = startBalance;
        this.mRoom = room;
        this.mPlayers = [];
        this.mDealer = 0;
        this.mPot = 0;
        this.mCommunityCards = [];
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
    public update(): void {
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                // No update for w4p... Do nothing.
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.distributeCards();
                break;
            case GameState.PREFLOP_BET:
                this.computeBet();
                break;
            case GameState.FLOP:
                this.revealCards(3); // flop always reveals 3 cards
                break;
            case GameState.TURN_BET:
                this.computeBet();
                break;
            case GameState.TURN:
                this.revealCards(1); // turn always reveals 1 card
                break;
            case GameState.RIVER_BET:
                this.computeBet();
                break;
            case GameState.RIVER:
                this.revealCards(1); // river always reveals 1 card
                break;
            case GameState.SHOWDOWN_BET:
                this.computeBet();
                break;
            case GameState.SHOWDOWN:
                this.showdown();
                break;
            case GameState.CLEANUP:
                this.clean();
                break;
            default:
                console.error(`Unknown game state!: ${GameState[this.mCurrentState]}`)
                break;
        }
    }

    private advanceState(): void {
        console.log(this.mCurrentState)
        switch (this.mCurrentState) {
            case GameState.WAITING_FOR_PLAYERS:
                this.mDistributeCardsData.currentPlayerIndex = 0;
                this.mCurrentState = GameState.DISTRIBUTE_CARDS;
                break;
            case GameState.DISTRIBUTE_CARDS:
                this.prepareBetRound();
                this.mCurrentState = GameState.PREFLOP_BET;
                break;
            case GameState.PREFLOP_BET:
                // TODO: do i need anything here?
                this.mCurrentState = GameState.FLOP;
                break;
            case GameState.FLOP:
                this.prepareBetRound();
                this.mCurrentState = GameState.TURN_BET;
                break;
            case GameState.TURN_BET:
                this.mCurrentState = GameState.TURN;
                break;
            case GameState.TURN:
                this.prepareBetRound();
                this.mCurrentState = GameState.RIVER_BET;
                break;
            case GameState.RIVER_BET:
                this.mCurrentState = GameState.RIVER;
                break;
            case GameState.RIVER:
                this.prepareBetRound();
                this.mCurrentState = GameState.SHOWDOWN_BET;
                break;
            case GameState.SHOWDOWN_BET:
                this.mCurrentState = GameState.SHOWDOWN;
                break;
            case GameState.SHOWDOWN:
                this.mCurrentState = GameState.CLEANUP;
                break;
            case GameState.CLEANUP:
                this.mCurrentState = GameState.WAITING_FOR_PLAYERS;
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

        // TODO: Proper poker behaviour
        // Choose random player as dealer
        this.mDealer = rndInt(0, this.mPlayers.length - 1);

        // --> Distribute cards
        this.advanceState();

        this.mRoom.onGameEvent(CallbackType.BROADCAST_CONFIRM,  {
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

        this.mRoom.onGameEvent(CallbackType.CLIENT_CONFIRM,  {
            recipient: player.name,
            gameEvent: GameEvent.DISTRIBUTE_HAND,
            content: player.cards
        } as DistributeHandMessage);
    }

    // endregion

    // region State: (PREFLOP|TURN|RIVER|SHOWDOWN) Bet
    private prepareBetRound(): void {
        this.mBetData.currentPlayerIdx = this.mDealer; // TODO: Proper poker behaviour
        this.mBetData.playersToProcess = this.wasined(this.mDealer, this.mPlayers.length);
        this.mBetData.lastBet = this.mBigBlind;
    }

    private computeBet(): void {
        
        if (this.mCurrentState !== GameState.PREFLOP_BET && this.mCurrentState !== GameState.TURN_BET
            && this.mCurrentState !== GameState.RIVER_BET && this.mCurrentState !== GameState.SHOWDOWN_BET) {
            console.error("Bug: compute bet called in wrong state!");
            return; // Refuse
        }

        let res: number = this.mBetData.processNext()!;

        // If the player is has folded call update to prevent losing context
        if (!this.mPlayers[res].isActive) {
            this.update();
        } else {
            this.mRoom.onGameEvent(CallbackType.SPECIFIC_CLIENT_WITH_RESULT, {
                recipient: this.mPlayers[this.mBetData.currentPlayerIdx].name,
                gameEvent: GameEvent.BET_REQUEST,
                content: null
            } as BetRequestMessage);
        }
    }
    // endregion

    // region State: Flop|Turn|River
    private revealCards(amount: number): void {
        if (this.mCurrentState !== GameState.FLOP
            && this.mCurrentState !== GameState.TURN
            && this.mCurrentState !== GameState.RIVER) {
            console.error("Bug: reveal cards called in wrong state!");
            return; // Refuse
        }

        let communityCards: Card[] = [];

        for (let i = 0; i < amount; i++) {
            communityCards.push(this.mAvailableCards.splice(rndInt(0, this.mAvailableCards.length - 1), 1)[0]);
        }

        this.mCommunityCards = this.mCommunityCards.concat(communityCards);

        // Next betting round: TURN_BET|RIVER_BET|SHOWDOWN_BET
        this.advanceState();

        this.mRoom.onGameEvent(CallbackType.BROADCAST_CONFIRM, {
            recipient: null,
            gameEvent: GameEvent.REVEAL_COMMUNITY,
            content: this.mCommunityCards
        } as RevealCommunityCardsMessage);
    }
    // endregion

    // region State: Showdown
    private showdown(): void {
        if (this.mCurrentState !== GameState.SHOWDOWN) {
            console.error("Bug: showdown called in wrong state!");
            return; // Refuse
        }

        let winners: Player[] = PokerEvaluate.evalWinners(this.mPlayers, this.mCommunityCards);

        for (let winner of winners) {
            winner.balance += this.mPot / winners.length;
        }

        this.advanceState(); // --> cleanup
        this.mRoom.onGameEvent(CallbackType.BROADCAST_CONFIRM,  {
            recipient: null,
            gameEvent: GameEvent.SHOWDOWN,
            content: {
                hands: this.mPlayers.map(p => {
                    return { name: p.name, cards: p.cards }
                }),
                winners: winners.map(p => {
                    return { name: p.name };
                }),
                amountPerWinner: this.mPot / winners.length
            },
        } as ShowdownMessage);
    }
    // endregion

    // region State: cleanup
    private clean(): void {
        this.mPot = 0;
        this.mCommunityCards = [];
        this.mAvailableCards = Deck.slice(0, Deck.length);
        this.mDistributeCardsData.currentPlayerIndex = 0;
        this.mBetData.lastBet = this.mBigBlind;
        this.mBetData.currentPlayerIdx = 0;

        this.advanceState();

        this.mRoom.onGameEvent(CallbackType.BROADCAST_CONFIRM,  {
            recipient: null,
            gameEvent: GameEvent.GAME_ENDED,
            content: null
        } as GameEndedMessage);
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
                this.mPot += bd.lastBet + msg.amount!;
                bd.lastBet += msg.amount!;

                break;
            case "call":
                if (!pl.canAfford(bd.lastBet)) {
                    return [false, "You can not bet more than your current balance"];
                }

                pl.balance -= bd.lastBet
                this.mPot += bd.lastBet;

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

        if (this.mBetData.remainingPlayers === 0) {
            this.advanceState(); // --> Flop / Turn / River / Showdown
        }

        this.mRoom.onGameEvent(CallbackType.BROADCAST_CONFIRM,  {
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