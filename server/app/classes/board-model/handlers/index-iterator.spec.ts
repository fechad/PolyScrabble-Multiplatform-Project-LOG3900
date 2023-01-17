import { DEFAULT_FIRST_ROW, DEFAULT_LAST_ROW, DEFAULT_ROWS } from '@app/constants/board-constants';
import { expect } from 'chai';
import { describe } from 'mocha';
import { IndexIterator } from './index-iterator';

describe('RowsIterator tests', () => {
    it('should return undefined if asked for next of last letter', () => {
        expect(IndexIterator.getNextRow(DEFAULT_LAST_ROW)).to.equals(undefined);
    });
    it('should return undefined if asked for previous of first letter', () => {
        expect(IndexIterator.getPreviousRow(DEFAULT_FIRST_ROW)).to.equals(undefined);
    });
    it('returns the correct letter when asked for the next letter', () => {
        expect(IndexIterator.getNextRow(DEFAULT_FIRST_ROW)).to.equals(DEFAULT_ROWS[1]);
    });
    it('returns the correct letter when asked for the previous letter', () => {
        expect(IndexIterator.getPreviousRow(DEFAULT_ROWS[1])).to.equals(DEFAULT_FIRST_ROW);
    });
    it('should return the letter of the row', () => {
        const letterZero = IndexIterator.rows[0];
        expect(IndexIterator.getRowLetter(0)).to.equal(letterZero);
    });
});
