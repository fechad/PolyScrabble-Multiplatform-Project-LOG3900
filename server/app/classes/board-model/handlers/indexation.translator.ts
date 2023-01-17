import { DEFAULT_COLUMN_COUNT, DEFAULT_ROWS, MIN_COLUMN_INDEX } from '@app/constants/board-constants';
import { Directions } from '@app/enums/directions';
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
    findNodeIndex(nodeIndex: number, direction: Directions, distance: number): number | undefined {
        let index: number | undefined = nodeIndex;
        while (index && distance > 0) {
            index = this.findNeighborIndex(index, direction);
            distance--;
        }
        return index;
    }
    findTableIndex(row: string, columnIndex: number): number | undefined {
        if (IndexIterator.getRowIndex(row) < IndexIterator.getRowIndex(this.rows[0])) return undefined;
        if (columnIndex > this.columnCount) return undefined;
        return columnIndex + IndexIterator.getRowIndex(row) * this.columnCount;
    }
    findNeighborIndex(nodeIndex: number, direction: Directions): number | undefined {
        switch (direction) {
            case Directions.Up:
                return this.getUpNeighborIndex(nodeIndex);
            case Directions.Down:
                return this.getDownNeighborIndex(nodeIndex);
            case Directions.Right:
                return this.getRightNeighborIndex(nodeIndex);
            case Directions.Left:
                return this.getLeftNeighborIndex(nodeIndex);
        }
    }
    findRowLetter(tableIndex: number): string | undefined {
        if (tableIndex > this.caseCount + 1 || tableIndex < 1) return undefined;
        return this.rows[this.computeRowLetter(tableIndex)];
    }
    findColumnIndex(tableIndex: number): number | undefined {
        if (tableIndex > this.caseCount + 1 || tableIndex < 1) return undefined;
        const modValue = tableIndex % this.columnCount;
        if (modValue === 0) return tableIndex;
        return tableIndex % this.columnCount;
    }
    private isRowEnd(nodeIndex: number): boolean {
        if (nodeIndex % this.columnCount === 0) return true;
        return false;
    }
    private isRowStart(nodeIndex: number): boolean {
        if (nodeIndex % this.columnCount === 1) return true;
        return false;
    }
    // Index computation
    private computeUpNeighborIndex(nodeIndex: number) {
        return nodeIndex - this.columnCount;
    }
    private computeDownNeighborIndex(nodeIndex: number) {
        return nodeIndex + this.columnCount;
    }
    private computeRightNeighborIndex(nodeIndex: number) {
        return nodeIndex + 1;
    }

    private computeLeftNeighborIndex(nodeIndex: number) {
        return nodeIndex - 1;
    }
    private computeRowLetter(tableIndex: number): number {
        return (tableIndex - (tableIndex % this.columnCount)) / this.columnCount;
    }
    // Get neighbors
    private getUpNeighborIndex(nodeIndex: number): number | undefined {
        const index: number = this.computeUpNeighborIndex(nodeIndex);
        if (index < this.minColumnIndex) return undefined;
        return index;
    }
    private getDownNeighborIndex(nodeIndex: number): number | undefined {
        const index = this.computeDownNeighborIndex(nodeIndex);
        if (index >= this.caseCount + 1) return undefined;
        return index;
    }
    private getRightNeighborIndex(nodeIndex: number): number | undefined {
        if (this.isRowEnd(nodeIndex)) return undefined;
        return this.computeRightNeighborIndex(nodeIndex);
    }
    private getLeftNeighborIndex(nodeIndex: number): number | undefined {
        if (this.isRowStart(nodeIndex)) return undefined;
        return this.computeLeftNeighborIndex(nodeIndex);
    }
}
