import { IndexIterator } from '@app/classes/board-model/handlers/index-iterator';
import { RACK_CAPACITY } from '@app/constants/constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { PlacementDirections } from '@app/enums/placement-directions';
import { PlacementIndexes } from '@app/interfaces/placement-indexes';
import { Board } from './board';
import { BoardMessage } from './board-message';
import { BoardNodesIterator } from './board-nodes-iterator';
import { DirectionHandler } from './handlers/direction-handler';
import { IndexationTranslator } from './handlers/indexation.translator';
import { SuccessMessageBuilder } from './handlers/success-message-builder';
import { BoardNode } from './nodes/board-node';

const MAX_LENGTH_REWARD = 50;
export class BoardManipulator {
    protected board: Board;
    protected newCases: number[];
    constructor(letterValues: Map<string, number>, dictionaryName?: string) {
        this.board = new Board(letterValues, dictionaryName);
        this.newCases = [];
    }

    checkBoardEmpty(): boolean {
        return this.board.getIsEmpty();
    }

    placeLetters(letters: string[], row: string, columnIndex: number, direction?: string, isPhantomPlacement?: boolean): BoardMessage {
        this.newCases = [];
        this.board.commitNewLinks();
        if (letters.length === 0) {
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoLetters };
        }
        let placementResult: BoardMessage;
        this.board.saveIsEmpty();
        if (direction === undefined) {
            placementResult = this.handleSinglePlacement(letters, row, columnIndex);
        } else {
            placementResult = this.handleMultiplePlacements(letters, row, columnIndex, direction as string, isPhantomPlacement);
        }
        if (isPhantomPlacement) {
            this.board.restoreBoard();
            return placementResult;
        }
        if (placementResult.title === BoardMessageTitle.SuccessfulPlacement) {
            this.board.commitNewLinks();
            this.board.askForDisable();
        }
        return placementResult;
    }

    askNode(row: string, columnIndex: number): BoardNode | undefined {
        const startNodeIndex = new IndexationTranslator().findTableIndex(row, columnIndex) as number;
        if (startNodeIndex) return this.board.getNode(startNodeIndex);
        return undefined;
    }

    getIterator(): BoardNodesIterator {
        return this.board.iterator;
    }

    askBoardRestoration() {
        this.board.restoreBoard();
    }

    protected checkHasNewNode(nodes: BoardNode[]) {
        let contained = false;
        nodes.forEach((value) => {
            if (this.newCases.includes(value.key)) contained = true;
        });
        return contained;
    }
    protected incrementIndex(placementIndexes: PlacementIndexes, placementDirection: PlacementDirections): boolean {
        switch (placementDirection) {
            case PlacementDirections.Horizontal:
                if (IndexIterator.isValidColumn(placementIndexes.column + 1)) {
                    placementIndexes.column++;
                    break;
                }
                return false;
            case PlacementDirections.Vertical:
                if (IndexIterator.getNextRow(placementIndexes.rowLetter) === undefined) return false;
                placementIndexes.rowLetter = IndexIterator.getNextRow(placementIndexes.rowLetter) as string;
                break;
        }
        return true;
    }
    private performWordValidation(row: string, columnIndex: number, placementDirection?: PlacementDirections) {
        const startNode = this.askNode(row, columnIndex);
        if (startNode === undefined) return;
        if (placementDirection === undefined) placementDirection = PlacementDirections.Horizontal;
        return this.board.askFormedWordsValidation(startNode, placementDirection);
    }

    private handleMultiplePlacements(
        letters: string[],
        row: string,
        columnIndex: number,
        direction: string,
        isPhantomPlacement?: boolean,
    ): BoardMessage {
        const successMessage = SuccessMessageBuilder.elaborateSuccessMessage(letters, row, columnIndex, direction);
        const result = this.iterateLetters(letters, row, columnIndex, direction);

        if (result.content !== successMessage.content) {
            this.board.restoreBoard();
            return result;
        }
        const validationResult = this.board.checkRulesRespected(isPhantomPlacement);
        if (validationResult.title === BoardMessageTitle.RulesBroken) {
            this.board.restoreBoard();
            return validationResult;
        }

        result.score = this.board.getPoints(row, columnIndex, direction);
        if (letters.length === RACK_CAPACITY) result.score += MAX_LENGTH_REWARD;
        return result;
    }

    private handleSinglePlacement(letters: string[], row: string, columnIndex: number): BoardMessage {
        if (letters.length > 1) {
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoDirection };
        }
        const result = this.board.placeLetter(letters[0], row, columnIndex);
        const wordsValidation = this.performWordValidation(row, columnIndex);
        const translator = new IndexationTranslator();
        this.newCases.push(translator.findTableIndex(row, columnIndex) as number);
        if (wordsValidation) return result;
        return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.InvalidWord };
    }

    private iterateLetters(letters: string[], row: string, columnIndex: number, direction: string): BoardMessage {
        let result: BoardMessage = { title: BoardMessageTitle.InProcess };
        const placementDirection = DirectionHandler.getPlacementDirections(direction);
        const placementIndexes = { rowLetter: row, column: columnIndex };
        const translator = new IndexationTranslator();

        for (const letter of letters) {
            result = this.board.placeLetter(letter, row, columnIndex, placementDirection);
            while (result.content === BoardMessageContent.OccupiedCase) {
                if (!this.incrementIndex(placementIndexes, placementDirection)) {
                    return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };
                }
                result = this.board.placeLetter(letter, placementIndexes.rowLetter, placementIndexes.column, placementDirection);
            }
            this.newCases.push(translator.findTableIndex(placementIndexes.rowLetter, placementIndexes.column) as number);
        }

        if (result.title !== BoardMessageTitle.SuccessfulPlacement) return result;
        const validationResult = this.performWordValidation(row, columnIndex, placementDirection);
        if (!validationResult) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.InvalidWord };
        return SuccessMessageBuilder.elaborateSuccessMessage(letters, row, columnIndex, placementDirection);
    }
}
