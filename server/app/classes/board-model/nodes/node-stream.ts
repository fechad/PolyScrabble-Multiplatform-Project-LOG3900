import { MultiplierType } from '@app/classes/classes-constants';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardNode } from './board-node';
export class NodeStream {
    private horizontalNodesFlow: BoardNode[];
    private verticalNodesFlow: BoardNode[];
    private startNode;

    constructor(startNode: BoardNode) {
        this.horizontalNodesFlow = new Array<BoardNode>();
        this.verticalNodesFlow = new Array<BoardNode>();
        this.startNode = startNode;
        this.horizontalNodesFlow[0] = startNode;
        this.verticalNodesFlow[0] = startNode;
    }
    getFirstNode(direction: PlacementDirections) {
        switch (direction) {
            case PlacementDirections.Horizontal:
                return this.horizontalNodesFlow[0];
            case PlacementDirections.Vertical:
                return this.verticalNodesFlow[0];
            default:
                return;
        }
    }
    getFlow(direction: PlacementDirections): BoardNode[] {
        if (direction === PlacementDirections.Horizontal) {
            return this.horizontalNodesFlow;
        }
        return this.verticalNodesFlow;
    }
    elaborateNodesFlow(direction: PlacementDirections) {
        if (direction === PlacementDirections.Horizontal) {
            this.goThroughFlow(Directions.Left);
            return;
        }
        this.goThroughFlow(Directions.Up);
    }
    elaborateBothFlows() {
        this.elaborateNodesFlow(PlacementDirections.Horizontal);
        this.elaborateNodesFlow(PlacementDirections.Vertical);
    }
    getScore(placementDirection: PlacementDirections): number {
        const stream = this.getFlow(placementDirection);
        if (stream.length < 2) return 0;
        let score = 0;
        let wordMultiplier = 1;

        for (const node of stream) {
            if (node.multiplierInfo === undefined) continue;
            if (node.multiplierInfo.multiplierType === MultiplierType.WordMultiplier) {
                wordMultiplier *= node.multiplierInfo.multiplierValue;
                score += node.value;
            } else score += node.value * node.multiplierInfo.multiplierValue;
            const previousMaxLength = node.maxStreamLength.get(placementDirection) as number;
            if (stream.length > previousMaxLength) node.maxStreamLength.set(placementDirection, stream.length);
        }
        return score * wordMultiplier;
    }
    getWord(placementDirection: PlacementDirections): string {
        const stream = this.getFlow(placementDirection);
        let word = '';
        for (const node of stream) {
            word = word.concat(node.content);
        }
        return word;
    }
    private insertNode(node: BoardNode, direction: Directions) {
        switch (direction) {
            case Directions.Up:
                this.verticalNodesFlow.unshift(node);
                break;
            case Directions.Down:
                this.verticalNodesFlow.push(node);
                break;
            case Directions.Left:
                this.horizontalNodesFlow.unshift(node);
                break;
            case Directions.Right:
                this.horizontalNodesFlow.push(node);
                break;
        }
    }
    private retraceFlow(direction: Directions) {
        let currentNode = this.startNode.getNeighbor(direction);
        while (currentNode !== undefined && currentNode.content !== '') {
            this.insertNode(currentNode, direction);
            currentNode = currentNode.getNeighbor(direction);
        }
    }
    private goThroughFlow(startingDirection: Directions) {
        this.retraceFlow(startingDirection);
        const reverseDirection = this.startNode.reverseDirection(startingDirection);
        this.retraceFlow(reverseDirection);
    }
}
