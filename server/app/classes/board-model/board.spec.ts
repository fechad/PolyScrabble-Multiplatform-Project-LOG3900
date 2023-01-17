import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import {
    CENTRAL_COLUMN_INDEX,
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
        board.placeLetter('a', DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX);
    });

    describe('Board table tests', () => {
        it('should have the correct number of cases', () => {
            expect(board.getTableLength()).to.equals(1 + DEFAULT_COLUMN_COUNT * DEFAULT_ROWS.length);
        });
        it('should have an undefined entry at index 0 when columnIndexing starts at 1', () => {
            board = new Board(letterValues);
            expect(board.getCaseContent(0)).to.equals(undefined);
        });
        it('should contain no node with undefined multiplierInfo', () => {
            let hasUndefined = false;
            // Exceptional use of any to test private attribute
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const node of (board as any).table) {
                if (node === undefined) {
                    continue;
                }
                if (node.multiplierInfo.multiplierValue === undefined) {
                    hasUndefined = true;
                    break;
                }
            }
            expect(hasUndefined).to.equals(false);
        });
    });
    describe('placeLetter tests', () => {
        it('The board does not place a letter outside of its vertical limit', () => {
            expect(board.placeLetter('a', OUT_OF_BOUNDS_ROW, THIRD_COLUMN_INDEX).content).to.equals(BoardMessageContent.OutOfBounds);
        });
        it('The board does not place a single letter outside of its horizontal limit', () => {
            expect(board.placeLetter('a', DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX + 1).content).to.equals(BoardMessageContent.OutOfBounds);
        });
        it('On the first turn, the board does not allow the placement of a single letter somewhere else than the center', () => {
            board = new Board(letterValues);
            expect(board.placeLetter('a', DEFAULT_FIRST_ROW, MIN_COLUMN_INDEX, undefined, true).content).to.equals(
                BoardMessageContent.CenterCaseEmpty,
            );
        });
        it('On the first turn, the board should allow the placement of a single letter at the center', () => {
            board = new Board(letterValues);
            // Potentially need to use a mock because of turn dependance
            expect(board.placeLetter('a', DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX).content).to.equals(
                SuccessMessageBuilder.elaborateSuccessMessage(['a'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX).content,
            );
        });
        it('should not place an empty string', () => {
            board = new Board(letterValues);
            expect(board.placeLetter('', DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX).content).to.equals(BoardMessageContent.NotValidLetter);
        });
    });
});
