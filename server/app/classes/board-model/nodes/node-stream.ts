import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardNode } from './board-node';

export class NodeStream {
    private flows: Map<PlacementDirections, BoardNode[][]>;
    private startNode: BoardNode;
    private direction: PlacementDirections;
    private isChildProcess: boolean;
    private nbrLettersToPlace: number;

    constructor(startNode: BoardNode, direction: PlacementDirections, nbrLettersToPlace: number, isChildProcess: boolean = false) {
        this.flows = new Map<PlacementDirections, BoardNode[][]>();
        this.flows.set(PlacementDirections.Horizontal, new Array<BoardNode[]>());
        this.flows.set(PlacementDirections.Vertical, new Array<BoardNode[]>());
        this.startNode = startNode;
        this.direction = direction;
        this.isChildProcess = isChildProcess;
        this.nbrLettersToPlace = nbrLettersToPlace;
        this.getBoardInfo();
    }

    isValidFlow(): boolean {
        return this.nbrLettersToPlace === 0;
    }

    getFlows(direction: PlacementDirections): BoardNode[][] | undefined {
        return this.flows.get(direction);
    }

    getScore(): number {
        let score = 0;
        let wordScore = 0;
        let wordMultiplier = 1;
        let isNewWord = false;
        this.flows.forEach((direction) => {
            direction.forEach((word) => {
                isNewWord = false;
                wordScore = 0;
                wordMultiplier = 1;
                word.forEach((letter) => {
                    wordScore += letter.getScore();
                    isNewWord = isNewWord || letter.isNewValue;
                    wordMultiplier *= letter.getWordMultiplier();
                });
                if (isNewWord) score += wordScore * wordMultiplier;
            });
        });
        return score;
    }

    getWords(): string[] {
        const words: string[] = new Array<string>();
        this.flows.forEach((direction) => {
            direction.forEach((word) => {
                let wordBuilder = '';
                word.forEach((node) => {
                    wordBuilder = wordBuilder.concat(node.content ? node.content : '');
                });
                words.push(wordBuilder);
            });
        });
        return words;
    }

    private getBoardInfo() {
        const opposite: PlacementDirections = DirectionHandler.reversePlacementDirection(this.direction);
        let currentNode: BoardNode = this.startNode;
        const flowBuilder: BoardNode[] = new Array<BoardNode>();

        // get to the beggining of the word
        while (currentNode.getNeighbor(DirectionHandler.towardsWordBeginning(this.direction))?.content)
            currentNode = currentNode.getNeighbor(DirectionHandler.towardsWordBeginning(this.direction)) as BoardNode;

        while (currentNode) {
            if (!currentNode.content && this.nbrLettersToPlace-- <= 0) break;
            flowBuilder.push(currentNode);

            if (
                !this.isChildProcess &&
                (currentNode.getNeighbor(DirectionHandler.towardsWordBeginning(opposite))?.content ||
                    currentNode.getNeighbor(DirectionHandler.towardsWordEnd(opposite))?.content)
            ) {
                const oppositeDirectionStream = new NodeStream(currentNode, opposite, 1, true);
                if ((oppositeDirectionStream.getFlows(opposite) as BoardNode[][])[0].length === 0) continue;
                this.flows.set(opposite, oppositeDirectionStream.getFlows(opposite) as BoardNode[][]);
            }
            currentNode = currentNode.getNeighbor(DirectionHandler.towardsWordEnd(this.direction)) as BoardNode;
        }
        this.flows.set(this.direction, [flowBuilder]);
    }
}
