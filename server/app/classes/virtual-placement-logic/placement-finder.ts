import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { NodeStream } from '@app/classes/board-model/nodes/node-stream';
import { Randomiser } from '@app/classes/randomiser';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { DEFAULT_DISTRIBUTION } from '@app/constants/virtual-player-constants';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { ScoreInterval } from '@app/interfaces/score-interval';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualTools } from '@app/interfaces/virtual-tools';

const MID_WEIGHT = 50;
const MIN_FIRST_PLACEMENT = 3;
export class PlacementFinder {
    centerNode: BoardNode;
    tools: VirtualTools;
    possiblePlacements: UserPlacement[];
    constructor(tools: VirtualTools) {
        this.tools = tools;
        this.possiblePlacements = [];
        const centerNode = this.tools.manipulator.askNode(DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX);
        if (centerNode === undefined) throw new Error('Board was not initialized properly');
        this.centerNode = centerNode;
    }
    getPlacement(targetScore: ScoreInterval, availableLetters: string): UserPlacement[] {
        this.possiblePlacements = [];
        if (this.checkCenterNode()) this.findFirstPlacement(targetScore, availableLetters);
        else this.findPlacements(targetScore, availableLetters);
        return this.possiblePlacements;
    }
    private findFirstPlacement(targetScore: ScoreInterval, availableLetters: string) {
        const probability = Randomiser.getRandomValue(DEFAULT_DISTRIBUTION) as number;
        const placement: UserPlacement = {
            row: 'h',
            col: 8,
            direction: PlacementDirections.Horizontal,
            oldWord: '',
            newWord: '',
            letters: '',
        };
        if (probability <= MID_WEIGHT) placement.direction = PlacementDirections.Vertical;

        const possibleWords = this.tools.fetcher.getPlacements(targetScore, '', availableLetters.split(''));

        for (const word of possibleWords) {
            const toPlace = { ...placement };
            if (word.length < MIN_FIRST_PLACEMENT) continue;
            toPlace.newWord = word;
            toPlace.letters = word;
            this.registerPossiblePlacements(toPlace, targetScore);
        }
    }

    private findPlacements(targetScore: ScoreInterval, availableLetters: string) {
        const iterator = this.tools.manipulator.getIterator();
        for (this.tools.manipulator.getIterator(); iterator.hasNext(); iterator.getNext()) {
            if (iterator.current.content === '') {
                continue;
            }
            const stream = new NodeStream(iterator.current);
            stream.elaborateBothFlows();
            this.findDirectionalPlacement(stream, targetScore, PlacementDirections.Horizontal, availableLetters);
            this.findDirectionalPlacement(stream, targetScore, PlacementDirections.Vertical, availableLetters);
        }
        iterator.goToStart();
    }
    private checkCenterNode(): boolean {
        return this.centerNode.content === '';
    }
    private registerPossiblePlacements(placement: UserPlacement, scoreInterval?: ScoreInterval) {
        const result = this.tools.manipulator.placeLetters(
            placement.newWord.replace(placement.oldWord, '').split(''),
            placement.row,
            placement.col,
            placement.direction,
            true,
        );
        if (result.title !== BoardMessageTitle.SuccessfulPlacement) return;
        if (scoreInterval) {
            if ((result.score as number) < scoreInterval.min || (result.score as number) > scoreInterval.max) {
                this.tools.manipulator.askBoardRestoration();
                return;
            }
        }
        placement.points = result.score;
        if (!this.possiblePlacements.includes(placement)) this.possiblePlacements.push(placement);
        this.tools.manipulator.askBoardRestoration();
    }
    private findDirectionalPlacement(
        nodeStream: NodeStream,
        scoreInterval: ScoreInterval,
        placementDirection: PlacementDirections,
        availableLetters: string,
    ) {
        const startNode = nodeStream.getFirstNode(placementDirection) as BoardNode;
        const base = nodeStream.getWord(placementDirection) as string;
        if (base.length < 1) return;
        const derivatives = this.tools.fetcher.getPlacements(scoreInterval, base, availableLetters.split(''));
        for (const word of derivatives) {
            const placement = {
                row: this.tools.translator.findRowLetter(startNode.key),
                col: this.tools.translator.findColumnIndex(startNode.key) as number,
                direction: placementDirection,
                newWord: word,
                oldWord: base,
                letters: availableLetters,
            } as UserPlacement;
            this.computePlacementStart(placement);
            if (placement.row === undefined || placement.col === undefined) continue;
            this.registerPossiblePlacements(placement, scoreInterval);
        }
    }
    private computePlacementStart(placement: UserPlacement) {
        const tableIndex = this.tools.translator.findTableIndex(placement.row, placement.col);
        let nodeIndex: number | undefined;
        if (tableIndex === undefined) return;
        let direction: Directions;
        placement.letters = placement.newWord.replace(placement.oldWord, '');
        if (placement.newWord.startsWith(placement.oldWord)) {
            direction = placement.direction === PlacementDirections.Horizontal ? Directions.Right : Directions.Down;
            nodeIndex = this.tools.translator.findNodeIndex(tableIndex, direction, placement.oldWord.length);
        } else if (placement.newWord.endsWith(placement.oldWord)) {
            direction = placement.direction === PlacementDirections.Horizontal ? Directions.Left : Directions.Up;
            nodeIndex = this.tools.translator.findNodeIndex(tableIndex, direction, placement.newWord.length);
        } else {
            direction = placement.direction === PlacementDirections.Horizontal ? Directions.Left : Directions.Up;
            const prefix = placement.newWord.replace(placement.oldWord, ' ').split(' ')[0];
            nodeIndex = this.tools.translator.findNodeIndex(tableIndex, direction, prefix.length);
        }
        if (nodeIndex === undefined) return;
        placement.col = this.tools.translator.findColumnIndex(nodeIndex) as number;
        placement.row = this.tools.translator.findRowLetter(nodeIndex) as string;
    }
}
