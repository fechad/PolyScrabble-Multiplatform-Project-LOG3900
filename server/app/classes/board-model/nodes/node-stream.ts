import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { MAX_WORD_LENGTH_REWARD, RACK_CAPACITY } from '@app/constants/constants';
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

    shadowPlacementScore(lettersToPlace: string, direction: PlacementDirections): number {
        // placing and removing letters may be dangerous
        const mainFlow = (this.getFlows(direction) as BoardNode[][])[0];
        let letterCount = 0;
        for (const node of mainFlow) {
            if (!node.content && letterCount < lettersToPlace.length) node.setLetter(lettersToPlace[letterCount++]);
        }
        const score = this.getScore();
        for (const node of mainFlow) {
            if (node.isNewValue) node.undoPlacement();
        }
        return score;
    }

    getScore(): number {
        let score = 0;
        let wordScore = 0;
        let wordMultiplier = 1;
        let needsBonus = false;
        let newLettersCount = 0;
        this.flows.forEach((direction) => {
            direction.forEach((word) => {
                wordScore = 0;
                wordMultiplier = 1;
                newLettersCount = 0;
                word.forEach((letter) => {
                    wordScore += letter.getScore();
                    wordMultiplier *= letter.isNewValue ? letter.getWordMultiplier() : 1;
                    if (letter.isNewValue) newLettersCount++;
                });
                score += wordScore * wordMultiplier;
                if (newLettersCount === RACK_CAPACITY) needsBonus = true;
            });
        });
        if (needsBonus) score += MAX_WORD_LENGTH_REWARD;
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
                !currentNode.content &&
                (currentNode.getNeighbor(DirectionHandler.towardsWordBeginning(opposite))?.content ||
                    currentNode.getNeighbor(DirectionHandler.towardsWordEnd(opposite))?.content)
            ) {
                const oppositeDirectionStream = new NodeStream(currentNode, opposite, 1, true);
                if ((oppositeDirectionStream.getFlows(opposite) as BoardNode[][])[0].length === 0) continue;
                if (this.flows.has(opposite)) {
                    this.flows.get(opposite)?.push((oppositeDirectionStream.getFlows(opposite) as BoardNode[][])[0]);
                } else {
                    this.flows.set(opposite, oppositeDirectionStream.getFlows(opposite) as BoardNode[][]);
                }
            }
            currentNode = currentNode.getNeighbor(DirectionHandler.towardsWordEnd(this.direction)) as BoardNode;
        }
        this.flows.set(this.direction, [flowBuilder]);
    }
}
