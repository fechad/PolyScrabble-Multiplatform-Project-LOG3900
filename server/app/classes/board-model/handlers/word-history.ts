import { DIRECT_PLACEMENT_HISTORY_MAX_LENGTH } from './word-history-constants';

export class WordHistory {
    wordsFormed: string[];
    private directPlacements: string[];
    constructor() {
        this.directPlacements = [];
        this.wordsFormed = [];
    }
    get directPlacementHistory(): string[] {
        return this.directPlacements;
    }
    registerDirectPlacement(word: string) {
        if (this.directPlacements.length >= DIRECT_PLACEMENT_HISTORY_MAX_LENGTH) this.directPlacements.pop();
        this.directPlacements.unshift(word);
    }
}
