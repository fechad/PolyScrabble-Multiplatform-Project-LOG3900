import { SpecialCasesReader } from '@app/classes/readers/special-cases-reader';
import { CENTRAL_NODE_INDEX, DEFAULT_COLUMN_COUNT, DEFAULT_ROWS, MAX_COLUMN_INDEX } from '@app/constants/board-constants';
import { DICTIONARY_READER } from '@app/constants/reader-constant';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardMessage } from '@app/interfaces/board-message';
import { DirectionHandler } from './handlers/direction-handler';
import { IndexationTranslator } from './handlers/indexation.translator';
import { SuccessMessageBuilder } from './handlers/success-message-builder';
import { BoardNode } from './nodes/board-node';
import { NodeStream } from './nodes/node-stream';

export class Board {
    private table: BoardNode[];
    private translator: IndexationTranslator;
    private placementScore: number;
    private letterValues: Map<string, number>;

    constructor(letterValues: Map<string, number>) {
        this.translator = new IndexationTranslator();
        this.table = new Array<BoardNode>(this.translator.caseCount);
        this.letterValues = letterValues;
        this.placementScore = 0;
        this.setupBoard();
    }
    getNode(index: number): BoardNode | BoardMessage {
        if (this.isValidIndex(index)) return this.table[index];
        return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };
    }
    getScore() {
        return this.placementScore;
    }
    checkLettersValidity(letters: string): boolean {
        if (letters.length < 1) return false;
        return [...letters].every((letter) => {
            return this.letterValues.has(letter.toLowerCase());
        });
    }
    isValidIndex(tableIndex: number | undefined): boolean {
        return tableIndex !== undefined && tableIndex < MAX_COLUMN_INDEX * DEFAULT_COLUMN_COUNT;
    }
    placeLetter(letters: string, row: string, column: number, direction?: PlacementDirections): BoardMessage {
        const tableIndex = this.translator.findTableIndex(row, column) as number;
        if (letters.length === 1) direction = this.setOneLetterDirection(tableIndex);

        if (!this.isValidIndex(this.translator.findTableIndex(row, column)))
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };

        const basicVerificationsMessage: BoardMessage | undefined = this.basicVerifications(letters, tableIndex, direction);
        if (basicVerificationsMessage) return basicVerificationsMessage;

        direction = direction as PlacementDirections;

        const nodeStream = new NodeStream(this.table[tableIndex], direction, letters.length);
        let mainFlow: BoardNode[] | undefined = nodeStream.getFlows(direction)?.at(0);
        const otherFlows: BoardNode[][] | undefined = nodeStream.getFlows(DirectionHandler.reversePlacementDirection(direction));
        if (!mainFlow) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoLetters };
        mainFlow = mainFlow as BoardNode[];

        if (!this.isValidCenterPlacement(mainFlow))
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.CenterCaseEmpty };

        if (this.table[CENTRAL_NODE_INDEX].content && mainFlow.every((node) => !node.content) && (!otherFlows || !otherFlows[0]))
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NotConnected };

        this.placeOnBoard(mainFlow, letters);

        if (!DICTIONARY_READER.isValidWords(nodeStream.getWords())) {
            mainFlow.forEach((node) => {
                if (node.isNewValue) node.undoPlacement();
            });
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.InvalidWord };
        }
        this.placementScore = nodeStream.getScore();

        mainFlow.forEach((node) => {
            node.confirmPlacement();
        });

        const directionString: string | undefined = direction ? (direction === PlacementDirections.Horizontal ? 'H' : 'V') : undefined;
        return SuccessMessageBuilder.elaborateSuccessMessage([...letters], row, column, directionString, this.placementScore);
    }

    private placeOnBoard(mainFlow: BoardNode[], letters: string) {
        let placeLettersCount = 0;
        for (const node of mainFlow) {
            if (node.content) continue;
            node.setLetter(letters.at(placeLettersCount) as string);
            placeLettersCount++;
        }
        if (placeLettersCount !== letters.length) throw new Error("Some letters couldn't be placed on the board");
    }

    private basicVerifications(letters: string, tableIndex: number, direction?: PlacementDirections): undefined | BoardMessage {
        if (!this.checkLettersValidity(letters)) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NotValidLetter };

        if (tableIndex === undefined) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };

        if (this.table[tableIndex].content) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OccupiedCase };

        if (letters.length < 1) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoLetters };

        if (!direction) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NoDirection };

        return undefined;
    }

    private isValidCenterPlacement(mainFlow: BoardNode[]): boolean | undefined {
        return (
            this.table[CENTRAL_NODE_INDEX].content !== null ||
            mainFlow.some((node: BoardNode) => {
                return node.index === CENTRAL_NODE_INDEX;
            })
        );
    }

    private setupBoard() {
        const specialCaseReader = new SpecialCasesReader();
        for (let i = 0; i < this.translator.caseCount; i++) {
            this.table[i] = new BoardNode(i, specialCaseReader.getSpecialCaseInfo(i));
        }
        for (let i = 0; i < this.translator.caseCount; i++) {
            const neighbors = new Map<Directions, BoardNode>();
            const upNeighbor: BoardNode | undefined = this.getNeighbor(i, Directions.Up);
            if (upNeighbor) neighbors.set(Directions.Up, upNeighbor);

            const downNeighbor: BoardNode | undefined = this.getNeighbor(i, Directions.Down);
            if (downNeighbor) neighbors.set(Directions.Down, downNeighbor);

            const leftNeighbor: BoardNode | undefined = this.getNeighbor(i, Directions.Left);
            if (i % DEFAULT_COLUMN_COUNT !== 0 && leftNeighbor) neighbors.set(Directions.Left, leftNeighbor);

            const rightNeighbor: BoardNode | undefined = this.getNeighbor(i, Directions.Right);
            if ((i + 1) % DEFAULT_COLUMN_COUNT !== 0 && rightNeighbor) neighbors.set(Directions.Right, rightNeighbor);

            neighbors.forEach((node, direction) => {
                this.table[i].registerNeighbor(node, direction);
            });
        }
    }
    private getNeighbor(index: number, direction: Directions): BoardNode | undefined {
        let triedIndex = -1;
        switch (direction) {
            case Directions.Up:
                triedIndex = index - DEFAULT_COLUMN_COUNT;
                break;
            case Directions.Down:
                triedIndex = index + DEFAULT_COLUMN_COUNT;
                break;
            case Directions.Left:
                triedIndex = index - 1;
                break;
            case Directions.Right:
                triedIndex = index + 1;
                break;
        }
        if (triedIndex < 0 || triedIndex >= DEFAULT_COLUMN_COUNT * DEFAULT_ROWS.length) return undefined;
        return this.table[triedIndex];
    }
    private setOneLetterDirection(tableIndex: number): PlacementDirections {
        return this.table[CENTRAL_NODE_INDEX].content === null ||
            this.getNeighbor(tableIndex, Directions.Right)?.content ||
            this.getNeighbor(tableIndex, Directions.Left)?.content
            ? PlacementDirections.Horizontal
            : PlacementDirections.Vertical;
    }
}
