import { DEFAULT_COLUMN_COUNT, DEFAULT_ROWS, MIN_COLUMN_INDEX } from '@app/constants/board-constants';
import { IndexIterator } from './index-iterator';

export class IndexationTranslator {
    rows: string[];
    minColumnIndex: number;
    columnCount: number;
    caseCount: number;
    rowCount: number;
    constructor(rows: string[] = DEFAULT_ROWS, columnCount: number = DEFAULT_COLUMN_COUNT, minColumnIndex: number = MIN_COLUMN_INDEX) {
        this.rows = rows;
        this.columnCount = columnCount;
        this.minColumnIndex = minColumnIndex;
        this.rowCount = this.rows.length;
        this.caseCount = this.columnCount * this.rowCount;
    }
    findTableIndex(row: string, columnIndex: number): number | undefined {
        if (IndexIterator.getRowIndex(row) < IndexIterator.getRowIndex(this.rows[0])) return undefined;
        if (columnIndex > this.columnCount) return undefined;
        return columnIndex + IndexIterator.getRowIndex(row) * this.columnCount - 1;
    }
    findRowLetter(tableIndex: number): string | undefined {
        if (tableIndex > this.caseCount || tableIndex < 0) return undefined;
        return this.rows[this.computeRowLetter(tableIndex)];
    }
    findColumnIndex(tableIndex: number): number | undefined {
        if (tableIndex > this.caseCount || tableIndex < 0) return undefined;
        return (tableIndex % this.columnCount) + 1;
    }
    private computeRowLetter(tableIndex: number): number {
        return Math.floor(tableIndex / this.columnCount);
    }
}
