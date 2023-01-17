/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { IndexIterator } from '@app/classes/board-model/handlers/index-iterator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { describe } from 'mocha';

const TEST_WORD = 'eU';
const SECOND_TEST_WORD = 'bon';
const SEVEN_LETTER_WORD = 'irradie';
const SEVEN_LETTERS = SEVEN_LETTER_WORD.split('');
const TEST_LETTERS = TEST_WORD.split('');
const SECOND_TEST_LETTERS = SECOND_TEST_WORD.split('');
const TEST_WORD_SCORE = 1;
const WORD_MULTIPLIER = 2;
const SEVEN_LETTERS_SCORE = 70;
describe('PointsCalculator tests', () => {
    let boardManipulator: BoardManipulator;
    const letterValues = new LetterBank().produceValueMap();
    beforeEach(() => {
        boardManipulator = new BoardManipulator(letterValues);
    });
    it('should not give points for capital letters', () => {
        const result = boardManipulator.placeLetters(TEST_LETTERS, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal);
        expect(result.score).to.equals(TEST_WORD_SCORE * WORD_MULTIPLIER);
    });
    it('should add up points correctly despite words intersections', () => {
        boardManipulator.placeLetters(SECOND_TEST_LETTERS, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal);
        const result = boardManipulator.placeLetters(
            TEST_LETTERS,
            IndexIterator.getNextRow(DEFAULT_CENTRAL_ROW) as string,
            CENTRAL_COLUMN_INDEX,
            PlacementDirections.Vertical,
        );
        expect(result.score).to.equals(TEST_WORD_SCORE + (letterValues.get(SECOND_TEST_WORD[0]) as number));
    });
    it('should disable special cases multipliers at the end of the turn', () => {
        boardManipulator.placeLetters(['e', 'a', 'u'], 'h', CENTRAL_COLUMN_INDEX - 1, PlacementDirections.Horizontal);
        const result = boardManipulator.placeLetters(['e', 'u'], 'g', CENTRAL_COLUMN_INDEX, PlacementDirections.Vertical);
        expect(result.score).to.equals(3);
    });
    it('should not disable special cases after an invalid placement', () => {
        boardManipulator.placeLetters(['t', 't', 't'], 'h', CENTRAL_COLUMN_INDEX - 1, PlacementDirections.Horizontal);
        const result = boardManipulator.placeLetters(['e', 'a', 'u'], 'h', CENTRAL_COLUMN_INDEX - 1, PlacementDirections.Horizontal);
        expect(result.score).to.equals(CENTRAL_COLUMN_INDEX - 2);
    });
    it('should give a special bonus for placing 7 letters at once', () => {
        const result = boardManipulator.placeLetters(SEVEN_LETTERS, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal);
        expect(result.score).to.equals(SEVEN_LETTERS_SCORE);
    });
    it('should add up points correctly on first placements', () => {
        const result = boardManipulator.placeLetters('dirigees'.split(''), 'h', 8, PlacementDirections.Horizontal);
        expect(result.score).to.equals(72);
    });
    it('should handle cross sections on special cases', () => {
        boardManipulator.placeLetters('vases'.split(''), 'h', 8, PlacementDirections.Horizontal);
        boardManipulator.placeLetters('zone'.split(''), 'e', 11, PlacementDirections.Vertical);
        const result = boardManipulator.placeLetters('mi'.split(''), 'f', 10, PlacementDirections.Horizontal);
        expect(result.score).to.equals(8);
    });
});
