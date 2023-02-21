import { RACK_CAPACITY } from '@app/constants/constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { Board } from './board';
import { BoardMessage } from './board-message';
import { DirectionHandler } from './handlers/direction-handler';
import { IndexationTranslator } from './handlers/indexation.translator';
import { BoardNode } from './nodes/board-node';

const MAX_LENGTH_REWARD = 50;
export class BoardManipulator {
    protected board: Board;

    constructor(letterValues: Map<string, number>, dictionaryName?: string) {
        this.board = new Board(letterValues, dictionaryName);
    }

    placeLetters(letters: string[], row: string, columnIndex: number, direction?: string, isPhantomPlacement?: boolean): BoardMessage {
        if (letters.length === 0) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoLetters };
        const result = this.board.placeLetter(
            letters.join(''),
            row,
            columnIndex,
            DirectionHandler.getPlacementDirections(direction as string),
            isPhantomPlacement,
        );
        if (result.title === BoardMessageTitle.RulesBroken) return result;
        result.score = this.board.getScore();
        if (letters.length === RACK_CAPACITY) result.score += MAX_LENGTH_REWARD;
        return result;
    }

    askNode(row: string, columnIndex: number): BoardNode | BoardMessage {
        const startNodeIndex = new IndexationTranslator().findTableIndex(row, columnIndex) as number;
        if (startNodeIndex) return this.board.getNode(startNodeIndex);
        return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };
    }
    askNodeByIndex(index: number): BoardNode | BoardMessage {
        if (!this.board.isValidIndex(index)) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };
        return this.board.getNode(index);
    }
}
