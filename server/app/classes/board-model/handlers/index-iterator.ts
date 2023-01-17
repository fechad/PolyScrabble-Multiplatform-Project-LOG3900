import { DEFAULT_COLUMN_COUNT, DEFAULT_ROWS } from '@app/constants/board-constants';

export class IndexIterator {
    static rows: string[] = DEFAULT_ROWS;
    static maxIndex = DEFAULT_COLUMN_COUNT;
    static getPreviousRow(letter: string) {
        if (letter === this.rows[0]) return undefined;
        return this.rows[this.getRowIndex(letter) - 1];
    }
    static getNextRow(letter: string) {
        if (letter === this.rows[this.rows.length - 1]) return undefined;
        return this.rows[this.getRowIndex(letter) + 1];
    }
    static getRowIndex(letter: string): number {
        return this.rows.findIndex((x) => x === letter);
    }
    static getRowLetter(index: number): string {
        return this.rows[index];
    }
    static isValidColumn(columnIndex: number) {
        return columnIndex <= this.maxIndex;
    }
}
