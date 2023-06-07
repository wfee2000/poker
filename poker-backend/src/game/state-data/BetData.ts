export class BetData {
    private mCurrentPlayerIdx: number;
    private mPlayersToProcess: number[];

    constructor() {
        this.mCurrentPlayerIdx = 0;
        this.mPlayersToProcess = [];
    }

    public processNext(): number | null {
        if (this.mPlayersToProcess.length === 0) {
            return null;
        }

        this.mCurrentPlayerIdx = this.mPlayersToProcess.slice(0, 1)[0];
        return this.mCurrentPlayerIdx; // remove first element
    }

    public get remainingPlayers(): number {
        return this.mPlayersToProcess.length;
    }

    public set playersToProcess(idxs: number[]) {
        this.mPlayersToProcess = idxs;
    }

    public get currentPlayerIdx(): number {
        return this.mCurrentPlayerIdx;
    }

    public set currentPlayerIdx(idx: number) {
        this.mCurrentPlayerIdx = idx;
    }
}