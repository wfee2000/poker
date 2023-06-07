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

export type GameActionResult = [boolean, string | null];