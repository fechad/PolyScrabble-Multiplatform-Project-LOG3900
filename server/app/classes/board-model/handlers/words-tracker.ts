import { WordHistory } from './word-history';

export class WordsTracker {
    private playersWordHistories: Map<string, WordHistory> = new Map<string, WordHistory>();

    registerDirectPlacement(word: string, playerName: string) {
        this.registerPlayer(playerName);
        this.playersWordHistories.get(playerName)?.registerDirectPlacement(word);
    }
    registerWordFormed(word: string, playerName: string) {
        if (word.length < 2) return;
        this.registerPlayer(playerName);
        this.playersWordHistories.get(playerName)?.wordsFormed.push(word);
    }
    resetWordsFormed(playerName: string) {
        if (!this.playersWordHistories.has(playerName)) return;
        (this.playersWordHistories.get(playerName) as WordHistory).wordsFormed = [];
    }
    getDirectPlacements(playerName: string): string[] {
        if (!this.playersWordHistories.has(playerName)) return [];
        return this.playersWordHistories.get(playerName)?.directPlacementHistory as string[];
    }
    getWordsFormed(playerName: string): string[] {
        if (!this.playersWordHistories.has(playerName)) return [];
        return this.playersWordHistories.get(playerName)?.wordsFormed as string[];
    }
    getWordsFormedCount(playerName: string): number {
        if (!this.playersWordHistories.has(playerName)) return 0;
        return this.playersWordHistories.get(playerName)?.wordsFormed.length as number;
    }
    private registerPlayer(playerName: string) {
        if (!this.playersWordHistories.has(playerName)) this.playersWordHistories.set(playerName, new WordHistory());
    }
}
