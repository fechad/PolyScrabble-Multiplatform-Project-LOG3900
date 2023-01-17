import { PointsCalculator } from '@app/classes/board-model/calculators/points-calculator';
import { RulesValidator } from '@app/classes/board-model/validators/rules-validator';
import { WordsValidator } from '@app/classes/board-model/validators/words-validator';
import { SpecialCasesReader } from '@app/classes/readers/special-cases-reader';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardMessage } from './board-message';
import { BoardNodesIterator } from './board-nodes-iterator';
import { DirectionHandler } from './handlers/direction-handler';
import { IndexationTranslator } from './handlers/indexation.translator';
import { SpecialCasesHandler } from './handlers/special-cases-handler';
import { SuccessMessageBuilder } from './handlers/success-message-builder';
import { BoardNode } from './nodes/board-node';
import { NodeLink } from './nodes/node-link';

export class Board {
    translator: IndexationTranslator;
    iterator: BoardNodesIterator;
    private table: BoardNode[];
    private rulesValidator: RulesValidator;
    private wordsValidator: WordsValidator;
    private letterValues: Map<string, number>;
    private newLinksHistory: NodeLink[];
    private disabler: SpecialCasesHandler;

    constructor(letterValues: Map<string, number>, dictionaryName?: string) {
        this.translator = new IndexationTranslator();
        this.wordsValidator = new WordsValidator(dictionaryName);
        this.table = new Array<BoardNode>(this.translator.caseCount + 1);
        this.disabler = new SpecialCasesHandler();
        const specialCaseReader = new SpecialCasesReader();
        for (let i = this.translator.minColumnIndex; i <= this.translator.caseCount; i++) {
            this.table[i] = new BoardNode('', i, specialCaseReader.getSpecialCaseInfo(i));
        }
        this.rulesValidator = new RulesValidator(this.translator.findTableIndex(DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX) as number);
        this.letterValues = letterValues;
        this.iterator = new BoardNodesIterator(this.table);
        this.newLinksHistory = [];
    }
    getPoints(row: string, columnIndex: number, direction?: string): number {
        if (direction === undefined) direction = PlacementDirections.Horizontal;
        const tableIndex = this.translator.findTableIndex(row, columnIndex);

        if (tableIndex === undefined) return 0;
        return PointsCalculator.computeNewPoints(this.table[tableIndex], DirectionHandler.getPlacementDirections(direction));
    }
    getNode(nodeIndex: number): BoardNode {
        return this.table[nodeIndex];
    }
    askFormedWordsValidation(startNode: BoardNode, placementDirection: PlacementDirections): boolean {
        return this.wordsValidator.validateWordsFormed(startNode, placementDirection);
    }

    checkRulesRespected(placementTest?: boolean): BoardMessage {
        if (placementTest) return this.rulesValidator.performValidation(true);
        return this.rulesValidator.performValidation();
    }
    getIsEmpty(): boolean {
        return this.rulesValidator.centerIsFull;
    }
    saveIsEmpty() {
        this.rulesValidator.centerIsFullSave = this.rulesValidator.centerIsFull;
    }
    restoreBoard() {
        this.revertNewLinks();
        this.rulesValidator.modifiedCases.forEach((node, index) => {
            this.table[index].clearNewLinksHistory();
            this.table[index].content = node.content;
            this.table[index].value = node.value;
            this.table[index].maxStreamLength = node.maxStreamLength;
            this.table[index].multiplierInfo = node.multiplierInfo;
        });
        this.rulesValidator.resetValues();
    }

    getTableLength(): number {
        return this.table.length;
    }

    getCaseContent(index: number): BoardNode {
        return this.table[index];
    }

    linkNeighbors(tableIndex: number): boolean {
        const rightNeighborIndex = this.translator.findNeighborIndex(tableIndex, Directions.Right);
        const downNeighborIndex = this.translator.findNeighborIndex(tableIndex, Directions.Down);
        if (rightNeighborIndex !== undefined) {
            const rightNeighbor = this.table[rightNeighborIndex];
            if (!this.table[tableIndex].registerNeighbor(rightNeighbor, Directions.Right)) return false;
            this.newLinksHistory.push(this.table[tableIndex].getLink(Directions.Right) as NodeLink);
        }
        if (downNeighborIndex !== undefined) {
            const downNeighbor = this.table[downNeighborIndex];
            if (!this.table[tableIndex].registerNeighbor(downNeighbor, Directions.Down)) return false;
            this.newLinksHistory.push(this.table[tableIndex].getLink(Directions.Down) as NodeLink);
        }
        return true;
    }
    checkLetterValidity(letter: string): boolean {
        return this.letterValues.has(letter.toLowerCase());
    }
    checkTableIndexValidity(tableIndex: number | undefined): BoardMessage | boolean {
        if (tableIndex === undefined) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OutOfBounds };
        return true;
    }
    commitNewLinks() {
        this.newLinksHistory.forEach((entry) => {
            entry.commitLink();
        });
        this.newLinksHistory = [];
    }
    askForDisable() {
        this.disabler.disableCases();
    }
    placeLetter(letter: string, row: string, index: number, direction?: PlacementDirections, isSinglePlacement?: boolean): BoardMessage {
        if (!this.checkLetterValidity(letter)) return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.NotValidLetter };
        const tableIndex = this.translator.findTableIndex(row, index);
        const tableIndexValidity = this.checkTableIndexValidity(tableIndex);

        if (tableIndexValidity !== true) return tableIndexValidity as BoardMessage;
        if (this.table[tableIndex as number].content !== '')
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.OccupiedCase };
        if (!this.linkNeighbors(tableIndex as number))
            return { title: BoardMessageTitle.InvalidPlacement, content: BoardMessageContent.InternalLogicError };

        this.rulesValidator.registerModification(this.table[tableIndex as number], direction);

        // Using cast because checkLetterValidity already checked the letter is in letterValues
        if (letter !== letter.toLowerCase()) {
            letter = letter.toLowerCase();
            this.table[tableIndex as number].value = 0;
        } else this.table[tableIndex as number].value = this.letterValues.get(letter) as number;

        this.table[tableIndex as number].content = letter;
        this.disabler.register(this.table[tableIndex as number]);
        if (isSinglePlacement) {
            const validationResult = this.checkRulesRespected();
            if (validationResult.title === BoardMessageTitle.RulesBroken) return validationResult;
        }
        return SuccessMessageBuilder.elaborateSuccessMessage([letter], row, index);
    }
    private revertNewLinks() {
        this.newLinksHistory.forEach((entry) => {
            entry.unlink();
        });
    }
}
