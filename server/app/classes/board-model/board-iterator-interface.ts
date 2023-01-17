import { BoardNode } from './nodes/board-node';

export interface BoardIterator {
    current: BoardNode;
    getNext(): BoardNode | undefined;
    hasNext(): boolean;
}
