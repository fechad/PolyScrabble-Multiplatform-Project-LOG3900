import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import {
    CENTRAL_COLUMN_INDEX,
    CENTRAL_NODE_INDEX,
    DEFAULT_CENTRAL_ROW,
    DEFAULT_COLUMN_COUNT,
    DEFAULT_FIRST_ROW,
    DEFAULT_ROWS,
    MAX_COLUMN_INDEX,
    MIN_COLUMN_INDEX,
    OUT_OF_BOUNDS_ROW,
    THIRD_COLUMN_INDEX,
} from '@app/constants/board-constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Board } from './board';
import { SuccessMessageBuilder } from './handlers/success-message-builder';

describe('Board tests', () => {
    let board: Board;
    const letterBank = new LetterBank();
    const letterValues = letterBank.produceValueMap();

    beforeEach(() => {
        board = new Board(letterValues);
    });

    describe('Board table tests', () => {
        it('should have the correct number of cases', () => {
            expect(board.isValidIndex(DEFAULT_COLUMN_COUNT * DEFAULT_ROWS.length - 1)).to.equals(true);
            expect(board.isValidIndex(DEFAULT_COLUMN_COUNT * DEFAULT_ROWS.length)).to.equals(false);
        });
        it('should contain no undefined node', () => {
            // eslint-disable-next-line dot-notation
            const noUndefined: boolean = board['table'].every((node) => {
                return node !== undefined;
            });
            expect(noUndefined).to.equals(true);
        });
        it('should place a word in the center of the board', () => {
            const expectedScore = 4;
            expect(board.placeLetter('aa', 'h', CENTRAL_NODE_INDEX % DEFAULT_COLUMN_COUNT, PlacementDirections.Horizontal).content).to.equals(
                SuccessMessageBuilder.elaborateSuccessMessage(
                    ['a', 'a'],
                    DEFAULT_CENTRAL_ROW,
                    CENTRAL_NODE_INDEX % DEFAULT_COLUMN_COUNT,
                    'h',
                    expectedScore,
                ).content,
            );
        });
        it('On the first turn, the board does not allow the placement of a single letter somewhere else than the center', () => {
            board = new Board(letterValues);
            expect(board.placeLetter('a', DEFAULT_FIRST_ROW, MIN_COLUMN_INDEX, undefined).content).to.equals(BoardMessageContent.CenterCaseEmpty);
        });
        it('On the first turn, the board should allow a placement at the center', () => {
            board = new Board(letterValues);
            const expectedScore = 4;
            expect(board.placeLetter('aa', DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal).content).to.equals(
                SuccessMessageBuilder.elaborateSuccessMessage(['a', 'a'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, 'H', expectedScore).content,
            );
        });
    });
    describe('placeLetter tests', () => {
        beforeEach(() => {
            const expectedScore = 8;
            expect(board.placeLetter('allo', 'h', CENTRAL_NODE_INDEX % DEFAULT_COLUMN_COUNT, PlacementDirections.Horizontal).content).to.equals(
                SuccessMessageBuilder.elaborateSuccessMessage(
                    ['a', 'l', 'l', 'o'],
                    DEFAULT_CENTRAL_ROW,
                    CENTRAL_NODE_INDEX % DEFAULT_COLUMN_COUNT,
                    'h',
                    expectedScore,
                ).content,
            );
        });
        it('The board does not place a letter outside of its vertical limit', () => {
            expect(board.placeLetter('a', OUT_OF_BOUNDS_ROW, THIRD_COLUMN_INDEX).content).to.equals(BoardMessageContent.OutOfBounds);
        });
        it('The board does not place a single letter outside of its horizontal limit', () => {
            expect(board.placeLetter('a', DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX + 1).content).to.equals(BoardMessageContent.OutOfBounds);
        });
        it('should not place an empty string', () => {
            board = new Board(letterValues);
            expect(board.placeLetter('', DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX).content).to.equals(BoardMessageContent.NotValidLetter);
        });
    });
});
