import { expect } from 'chai';
import { describe } from 'mocha';
import { WordsTracker } from './words-tracker';

describe('WordsTracker ', () => {
    const player1 = 'playerOne';
    const player2 = 'playerTwo';
    let wordsTracker: WordsTracker;
    beforeEach(() => {
        wordsTracker = new WordsTracker();
    });
    it('should register direct placements correctly', () => {
        wordsTracker.registerDirectPlacement('placed', player1);
        wordsTracker.registerWordFormed('unplaced', player1);
        expect(wordsTracker.getDirectPlacements(player1)).to.deep.equals(['placed']);
    });
    it('Should register the wordsFormed by a player correctly', () => {
        wordsTracker.registerWordFormed('unplaced', player1);
        wordsTracker.registerWordFormed('triplePlaced', player2);
        expect(wordsTracker.getWordsFormedCount(player1)).to.equals(1);
        expect(wordsTracker.getWordsFormed(player1)).to.deep.equals(['unplaced']);
    });
    it('registering a directPlacement does not affect the wordsFormed list', () => {
        wordsTracker.registerDirectPlacement('placed', player1);
        wordsTracker.registerWordFormed('unplaced', player1);
        expect(wordsTracker.getWordsFormedCount(player1)).to.equals(1);
        expect(wordsTracker.getWordsFormed(player1)).to.deep.equals(['unplaced']);
    });
    it('should reset wordsFormed for a given player correctly', () => {
        wordsTracker.registerWordFormed('unplaced', player1);
        wordsTracker.resetWordsFormed(player1);
        expect(wordsTracker.getWordsFormedCount(player1)).to.equals(0);
    });
});
