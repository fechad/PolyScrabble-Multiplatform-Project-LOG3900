import {
    CENTRAL_COLUMN_INDEX,
    DEFAULT_CENTRAL_INDEX,
    DEFAULT_CENTRAL_ROW,
    DEFAULT_COLUMN_COUNT,
    DEFAULT_FIRST_ROW,
    DEFAULT_ROWS,
    MAX_COLUMN_INDEX,
    MIN_COLUMN_INDEX,
    OUT_OF_BOUNDS_ROW,
} from '@app/constants/board-constants';
import { Directions } from '@app/enums/directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { IndexationTranslator } from './indexation.translator';

describe('IndexationTranslator tests', () => {
    const translator = new IndexationTranslator();
    const centralCaseTableIndex = CENTRAL_COLUMN_INDEX + DEFAULT_CENTRAL_INDEX * MAX_COLUMN_INDEX;
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
        expect(translator.findColumnIndex(MAX_COLUMN_INDEX)).to.equals(MAX_COLUMN_INDEX);
    });
    it('findTableIndex returns the correct index', () => {
        expect(translator.findTableIndex(DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX)).to.equals(MAX_COLUMN_INDEX);
    });
    it('findTableIndex returns the undefined when given an out of bound row', () => {
        expect(translator.findTableIndex(OUT_OF_BOUNDS_ROW, MAX_COLUMN_INDEX)).to.equals(undefined);
    });
    it('findTableIndex returns the undefined when given an out of bound column', () => {
        expect(translator.findTableIndex(DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX + 1)).to.equals(undefined);
    });
    describe('findNeighborTests', () => {
        it('should return the correct index when asked for up neighbor', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT + 1, Directions.Up)).to.equals(1);
        });
        it('should return the undefined when asked for up neighbor of a case in the first row', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT, Directions.Up)).to.equals(undefined);
        });
        it('should return the correct index when asked for down neighbor', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT, Directions.Down)).to.equals(DEFAULT_COLUMN_COUNT * 2);
        });
        it('should return the undefined when asked for down neighbor of a case on the last row', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT * DEFAULT_ROWS.length, Directions.Down)).to.equals(undefined);
        });
        it('should return the correct index when asked for right neighbor', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT - 1, Directions.Right)).to.equals(DEFAULT_COLUMN_COUNT);
        });
        it('should return the undefined when asked for right neighbor of a case on the last column', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT, Directions.Right)).to.equals(undefined);
        });
        it('should return the correct index when asked for left neighbor', () => {
            expect(translator.findNeighborIndex(DEFAULT_COLUMN_COUNT, Directions.Left)).to.equals(DEFAULT_COLUMN_COUNT - 1);
        });
        it('should return the undefined when asked for left neighbor of a case on the first column', () => {
            expect(translator.findNeighborIndex(MIN_COLUMN_INDEX, Directions.Left)).to.equals(undefined);
        });
    });
    describe('findNodeIndex tests', () => {
        it('should return the correct index horizontally', () => {
            const expectedIndex = 1;
            const startIndex = 3;
            expect(translator.findNodeIndex(startIndex, Directions.Left, startIndex - expectedIndex)).to.equals(expectedIndex);
            expect(translator.findNodeIndex(expectedIndex, Directions.Right, startIndex - expectedIndex)).to.equals(startIndex);
        });
        it('should return the correct index vertically', () => {
            const expectedIndex = 30;
            const startIndex = 60;
            expect(translator.findNodeIndex(startIndex, Directions.Up, (startIndex - expectedIndex) / DEFAULT_COLUMN_COUNT)).to.equals(expectedIndex);
            expect(translator.findNodeIndex(expectedIndex, Directions.Down, (startIndex - expectedIndex) / DEFAULT_COLUMN_COUNT)).to.equals(
                startIndex,
            );
        });
    });
});
