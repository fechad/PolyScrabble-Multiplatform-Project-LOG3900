import { BoardIterator } from './board-iterator-interface';
import { BoardNode } from './nodes/board-node';

export class BoardNodesIterator implements BoardIterator {
    current: BoardNode;
    private table: BoardNode[];
    private startIndex: number;
    constructor(table: BoardNode[], startIndex: number = 1) {
        this.table = table;
        this.current = this.table[startIndex];
        this.startIndex = startIndex;
    }
    goToStart() {
        this.current = this.table[this.startIndex];
    }
    hasNext(): boolean {
        if (this.current.key >= this.table.length - 1) return false;
        return true;
    }
    getNext(): BoardNode | undefined {
        if (!this.hasNext()) return;
        this.current = this.table[this.current.key + 1];
        return this.current;
    }
}
