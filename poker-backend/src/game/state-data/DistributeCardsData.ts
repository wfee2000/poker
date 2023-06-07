export class DistributeCardsData {
    private mCurrentPlayerIndex: number;

    constructor() {
        this.mCurrentPlayerIndex = 0;
    }

    get currentPlayerIndex(): number {
        return this.mCurrentPlayerIndex;
    }

    set currentPlayerIndex(value: number) {
        this.mCurrentPlayerIndex = value;
    }
}