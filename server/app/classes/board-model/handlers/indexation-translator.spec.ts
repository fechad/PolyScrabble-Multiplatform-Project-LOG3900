import {
    CENTRAL_COLUMN_INDEX,
    DEFAULT_CENTRAL_INDEX,
    DEFAULT_CENTRAL_ROW,
    DEFAULT_FIRST_ROW,
    MAX_COLUMN_INDEX,
    OUT_OF_BOUNDS_ROW,
} from '@app/constants/board-constants';
import { expect } from 'chai';
import { describe } from 'mocha';
import { IndexationTranslator } from './indexation.translator';

describe('IndexationTranslator tests', () => {
    const translator = new IndexationTranslator();
    const centralCaseTableIndex = CENTRAL_COLUMN_INDEX - 1 + DEFAULT_CENTRAL_INDEX * MAX_COLUMN_INDEX;
    it('findColumnIndex returns the correct columnIndex', () => {
        expect(translator.findColumnIndex(centralCaseTableIndex)).to.equals(CENTRAL_COLUMN_INDEX);
    });
    it('findRowLetter returns the correct letter', () => {
        expect(translator.findRowLetter(centralCaseTableIndex)).to.equals(DEFAULT_CENTRAL_ROW);
    });
    it('findRowLetter returns undefined when given an invalid index', () => {
        expect(translator.findRowLetter(translator.caseCount + 2)).to.equals(undefined);
    });
    it('findColumnIndex returns undefined when given an invalid index', () => {
        expect(translator.findRowLetter(translator.caseCount + 2)).to.equals(undefined);
    });
    it('findColumnIndex returns the correct index when the table index is a multiple of the columnCount', () => {
        expect(translator.findColumnIndex(MAX_COLUMN_INDEX)).to.equals(1);
    });
    it('findTableIndex returns the correct index', () => {
        expect(translator.findTableIndex(DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX)).to.equals(MAX_COLUMN_INDEX - 1);
    });
    it('findTableIndex returns the undefined when given an out of bound row', () => {
        expect(translator.findTableIndex(OUT_OF_BOUNDS_ROW, MAX_COLUMN_INDEX)).to.equals(undefined);
    });
    it('findTableIndex returns the undefined when given an out of bound column', () => {
        expect(translator.findTableIndex(DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX + 1)).to.equals(undefined);
    });
});
