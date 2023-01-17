import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { DEFAULT_CENTRAL_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { PlacementDirections } from '@app/enums/placement-directions';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { PlacementFinder } from './placement-finder';
import { WordFetcher } from './word-fetcher';

const LETTERS = 'bonbonsjouri';
const TARGET_SCORE = { min: 2, max: 12 };
describe('PlacementFinder tests', () => {
    const dictionary = new DictionaryReader();
    const letterBank = new LetterBank();
    const wordFetcher = new WordFetcher();
    const indexationTranslator = new IndexationTranslator();
    wordFetcher.setWordsMap(dictionary.getWords());
    let boardManipulator = new BoardManipulator(letterBank.produceValueMap());
    let finder = new PlacementFinder({ fetcher: wordFetcher, bank: letterBank, translator: indexationTranslator, manipulator: boardManipulator });

    beforeEach(() => {
        boardManipulator = new BoardManipulator(letterBank.produceValueMap());
        finder = new PlacementFinder({ fetcher: wordFetcher, bank: letterBank, translator: indexationTranslator, manipulator: boardManipulator });
    });
    it('getPlacement should only return words with the valid score range when looking for a first placement', () => {
        const placements = finder.getPlacement(TARGET_SCORE, LETTERS);
        expect(placements.length).to.not.equals(0);
        placements.forEach((value) => {
            assert(
                (value.points as number) >= TARGET_SCORE.min && (value.points as number) <= TARGET_SCORE.max,
                'One of the placement did not respect the score range limit',
            );
        });
    });
    it('getPlacement should only return words that are part of the dictionary when looking for a first placement', () => {
        const placements = finder.getPlacement(TARGET_SCORE, LETTERS);
        expect(placements.length).to.not.equals(0);
        placements.forEach((value) => {
            assert(dictionary.hasWord(value.newWord), 'One of the new words proposed was not in the dictionary');
        });
    });
    it('getPlacement should only return words with the valid score range when looking for a placement that is not the first', () => {
        boardManipulator.placeLetters('bon'.split(''), DEFAULT_CENTRAL_ROW, DEFAULT_CENTRAL_INDEX, PlacementDirections.Horizontal);
        const placements = finder.getPlacement(TARGET_SCORE, LETTERS);
        expect(placements.length).to.not.equals(0);
        placements.forEach((value) => {
            assert(
                (value.points as number) >= TARGET_SCORE.min && (value.points as number) <= TARGET_SCORE.max,
                'One of the placement did not respect the score range limit',
            );
        });
    });
    it('getPlacement should only return words that are part of the dictionary when looking for a placement that is not the first', () => {
        boardManipulator.placeLetters('bon'.split(''), DEFAULT_CENTRAL_ROW, DEFAULT_CENTRAL_INDEX, PlacementDirections.Horizontal);
        const placements = finder.getPlacement(TARGET_SCORE, LETTERS);
        expect(placements.length).to.not.equals(0);
        placements.forEach((value) => {
            assert(dictionary.hasWord(value.newWord), 'One of the new words proposed was not in the dictionary');
        });
    });
});
