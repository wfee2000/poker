export class DistributeCardsData {
    private mCurrentPlayerIndex: number;

    constructor() {
        this.mCurrentPlayerIndex = 0;
    }

    public get currentPlayerIndex(): number {
        return this.mCurrentPlayerIndex;
    }

    public set currentPlayerIndex(value: number) {
        this.mCurrentPlayerIndex = value;
    }
}