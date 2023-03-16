import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { NodeStream } from '@app/classes/board-model/nodes/node-stream';
import { WordStructureTrie } from '@app/classes/Trie/structure-trie';
import { StringManipulator } from '@app/classes/virtual-placement-logic/string-manipulation-virtual-player';
import { WordsFinder } from '@app/classes/virtual-player/words-finder';
import { CENTRAL_NODE_INDEX, DEFAULT_COLUMN_COUNT, MAX_COLUMN_INDEX } from '@app/constants/board-constants';
import { INVALID, MAXIMUM_PLACEMENT_LENGTH, SCORE_INTERVALS } from '@app/constants/virtual-player-constants';
import { PlacementDirections } from '@app/enums/placement-directions';
import { ScoreInterval } from '@app/interfaces/score-interval';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualTools } from '@app/interfaces/virtual-tools';

export class PlacementFinder {
    centerNode: BoardNode;
    tools: VirtualTools;
    possiblePlacements: UserPlacement[];

    constructor(tools: VirtualTools) {
        this.tools = tools;
        this.possiblePlacements = [];
        this.centerNode = this.tools.manipulator.askNodeByIndex(CENTRAL_NODE_INDEX) as BoardNode;
    }

    getPlacement(availableLetters: string): UserPlacement[] {
        this.possiblePlacements = [];
        this.findPlacements(availableLetters);
        return this.possiblePlacements;
    }

    private findPlacements(availableLetters: string) {
        const scoreInterval = SCORE_INTERVALS.any;
        if (!this.centerNode.content) {
            const stream = new NodeStream(this.centerNode, PlacementDirections.Horizontal, MAXIMUM_PLACEMENT_LENGTH);
            this.findDirectionalPlacement(stream, scoreInterval, PlacementDirections.Horizontal, availableLetters);
            return;
        }
        for (let i = 0; i < MAX_COLUMN_INDEX * DEFAULT_COLUMN_COUNT; i++) {
            let node = this.tools.manipulator.askNodeByIndex(i);
            if (node === undefined) return;
            node = node as BoardNode;
            const streamH = new NodeStream(node, PlacementDirections.Horizontal, MAXIMUM_PLACEMENT_LENGTH);
            const streamV = new NodeStream(node, PlacementDirections.Vertical, MAXIMUM_PLACEMENT_LENGTH);
            if (!node.content && this.isStreamConnected(streamH, PlacementDirections.Horizontal))
                this.findDirectionalPlacement(streamH, scoreInterval, PlacementDirections.Horizontal, availableLetters);
            if (!node.content && this.isStreamConnected(streamV, PlacementDirections.Vertical))
                this.findDirectionalPlacement(streamV, scoreInterval, PlacementDirections.Vertical, availableLetters);
        }
    }

    private isStreamConnected(stream: NodeStream, directionStream: PlacementDirections): boolean {
        const mainFlow: BoardNode[] | undefined = stream.getFlows(directionStream)?.at(0);
        const otherFlows: BoardNode[][] | undefined = stream.getFlows(DirectionHandler.reversePlacementDirection(directionStream));

        if (!mainFlow) return false;
        // first placement logic
        if (
            !(
                this.centerNode.content !== null ||
                mainFlow.some((node: BoardNode) => {
                    return node.index === CENTRAL_NODE_INDEX;
                })
            )
        )
            return true;
        return !(this.centerNode.content && mainFlow.every((node) => !node.content) && (!otherFlows || !otherFlows[0]));
    }

    private registerPossiblePlacements(placement: UserPlacement) {
        this.possiblePlacements.push(placement);
    }
    private findDirectionalPlacement(
        nodeStream: NodeStream,
        scoreInterval: ScoreInterval,
        placementDirection: PlacementDirections,
        availableLetters: string,
    ) {
        const mainFlow = (nodeStream.getFlows(placementDirection) as BoardNode[][])[0];
        const otherFlows = nodeStream.getFlows(DirectionHandler.reversePlacementDirection(placementDirection)) as BoardNode[][];
        const base = this.getBaseFromFlow(mainFlow);
        const structureTrie = new WordStructureTrie(base);

        const restOfString = this.getRestOfString(mainFlow, otherFlows, base, placementDirection, availableLetters);
        const structures = StringManipulator.getAllStructures(restOfString);

        structures.forEach((structure) => {
            const indexesToSplit = StringManipulator.getSplitIndexes(structure);
            indexesToSplit.forEach((splitIndex) => {
                structureTrie.insert(structure.slice(0, splitIndex));
            });
        });
        const wordsFinder = new WordsFinder();
        const derivatives = wordsFinder.findFormableChildren(base, structureTrie.rootNode, [...availableLetters]);
        const minWordLength = this.findMinLength(mainFlow, otherFlows, placementDirection === PlacementDirections.Horizontal);

        for (const word of derivatives) {
            const lettersToPlace = this.getLettersToPlace(mainFlow, word);
            if (lettersToPlace.length <= minWordLength) continue;
            const score = nodeStream.shadowPlacementScore(lettersToPlace, placementDirection);
            if (score < scoreInterval.min || score > scoreInterval.max) continue;

            const firstEmptySquareInMainFlow = mainFlow.findIndex((node) => !node.content);
            const placement = {
                row: this.tools.translator.findRowLetter(mainFlow[firstEmptySquareInMainFlow].index),
                col: this.tools.translator.findColumnIndex(mainFlow[firstEmptySquareInMainFlow].index) as number,
                direction: placementDirection,
                newWord: word,
                oldWord: base,
                letters: lettersToPlace,
                points: score,
            } as UserPlacement;
            this.registerPossiblePlacements(placement);
        }
    }

    private findMinLength(mainFlow: BoardNode[], otherFlows: BoardNode[][], isHorizontalPlacement: boolean): number {
        let firstLetterInMainFlow = mainFlow.findIndex((node) => node.content);
        if (firstLetterInMainFlow > 0) firstLetterInMainFlow--;
        const firstConnectedWord = mainFlow.findIndex((node) =>
            otherFlows.some((flow) => this.isAligned(flow[0].index, node.index, isHorizontalPlacement)),
        );
        if (firstConnectedWord === INVALID) return firstLetterInMainFlow;
        if (firstLetterInMainFlow === INVALID) return firstConnectedWord;
        return firstConnectedWord < firstLetterInMainFlow ? firstConnectedWord : firstLetterInMainFlow;
    }

    private getLettersToPlace(mainFlow: BoardNode[], word: string): string {
        const wordArray = [...word];
        let offset = -1;
        for (const node of mainFlow) {
            offset++;
            if (!node.content) continue;
            wordArray.splice(wordArray.slice(offset).findIndex((letter) => letter === node.content) + offset, 1);
            offset--;
        }
        return wordArray.join('');
    }

    private getBaseFromFlow(flow: BoardNode[]): string {
        let base = '';
        for (const node of flow) {
            if (!node.content) break;
            base = base.concat(node.content);
        }
        return base;
    }

    private getRestOfString(
        mainFlow: BoardNode[],
        otherFlows: BoardNode[][],
        base: string,
        direction: PlacementDirections,
        availableLetters: string,
    ): string[] {
        let index = 0;
        const restOfString: string[] = [];
        const isHorizontal = direction === PlacementDirections.Horizontal;
        for (const node of mainFlow) {
            if (index++ < base.length) continue;
            if (node.content) {
                restOfString.push(node.content.toUpperCase());
                continue;
            }
            const alignedWord = this.alignedFlowWord(otherFlows, node.index, isHorizontal);
            restOfString.push(alignedWord ? StringManipulator.getPossibleLetters(alignedWord, availableLetters) : '_');
        }
        return restOfString;
    }

    private alignedFlowWord(otherFlows: BoardNode[][], index: number, isHorizontal: boolean): string | undefined {
        for (const flow of otherFlows) {
            if (flow.length === 0) return;
            if (this.isAligned(flow[0].index, index, isHorizontal)) {
                let wordBuilder = '';
                flow.forEach((node) => {
                    wordBuilder = wordBuilder.concat(node.content ? node.content : '_');
                });
                return wordBuilder;
            }
        }
        return;
    }

    private isAligned(firstIndex: number, secondIndex: number, mainWordIsHorizontal: boolean): boolean {
        if (mainWordIsHorizontal) return firstIndex % DEFAULT_COLUMN_COUNT === secondIndex % DEFAULT_COLUMN_COUNT;
        return Math.floor(firstIndex / DEFAULT_COLUMN_COUNT) === Math.floor(secondIndex / DEFAULT_COLUMN_COUNT);
    }
}
