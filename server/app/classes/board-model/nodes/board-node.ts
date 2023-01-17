import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { NodeLink } from './node-link';

export class BoardNode {
    content: string;
    value: number;
    key: number;
    multiplierInfo: SpecialCaseInfo;
    maxStreamLength: Map<PlacementDirections, number>;
    private neighbors: Map<Directions, NodeLink>;
    private newLinksHistory: Directions[];

    constructor(content: string, index: number, multiplierInfo?: SpecialCaseInfo) {
        this.newLinksHistory = new Array<Directions>();
        this.neighbors = new Map<Directions, NodeLink>();
        this.content = content;
        this.key = index;
        this.maxStreamLength = new Map<PlacementDirections, number>();
        this.maxStreamLength.set(PlacementDirections.Horizontal, 0);
        this.maxStreamLength.set(PlacementDirections.Vertical, 0);
        if (multiplierInfo === undefined) return;
        this.multiplierInfo = multiplierInfo;
    }
    disableMultiplier() {
        if (this.multiplierInfo === undefined || this.multiplierInfo.multiplierValue === undefined) return;
        this.multiplierInfo.multiplierValue = 1;
    }
    getNeighborsCount(): number {
        return this.neighbors.size;
    }
    hasOtherNeighbor(direction: Directions): boolean {
        for (const neighborDirection of this.neighbors.keys()) {
            if (neighborDirection !== direction) {
                if (this.neighbors.get(neighborDirection)?.getLinkedNode(this)?.content !== '') return true;
            }
        }
        return false;
    }
    getNeighbor(direction: Directions): BoardNode | undefined {
        return this.neighbors.get(direction)?.getLinkedNode(this);
    }
    reverseDirection(direction: Directions): Directions {
        switch (direction) {
            case Directions.Up:
                return Directions.Down;
            case Directions.Down:
                return Directions.Up;
            case Directions.Right:
                return Directions.Left;
            case Directions.Left:
                return Directions.Right;
        }
    }
    registerNeighbor(neighbor: BoardNode, targetDirection: Directions, link?: NodeLink): boolean {
        if (neighbor.key === this.key) return false;
        if (this.getNeighbor(targetDirection)) return false;
        const reverseDirection = this.reverseDirection(targetDirection);
        if (neighbor.getNeighbor(reverseDirection) && neighbor.getNeighbor(reverseDirection) !== this) return false;
        this.registerNewLink(targetDirection);
        if (link && link.checkIsPart(this)) {
            this.neighbors.set(targetDirection, link);
        } else {
            const newLink = new NodeLink(this, neighbor, DirectionHandler.transformDirection(targetDirection));
            this.neighbors.set(targetDirection, newLink);
            // We inverse the direction and ask the neighbor to register the current Node
            neighbor.registerNeighbor(this, reverseDirection, newLink);
        }
        return true;
    }
    cloneNode(): BoardNode {
        const nodeClone = new BoardNode(this.content, this.key);
        nodeClone.neighbors = this.cloneNeighbors();
        nodeClone.multiplierInfo = { ...this.multiplierInfo };
        return nodeClone;
    }
    clearNewLinksHistory() {
        this.newLinksHistory = new Array<Directions>();
    }

    checkHasFullNeighbor(): boolean {
        let hasFullNeighbor = false;
        this.neighbors.forEach((neighbor) => {
            if (this.getLinked(neighbor) === undefined) hasFullNeighbor = false;
            else if (neighbor && (this.getLinked(neighbor) as BoardNode).content !== '') hasFullNeighbor = true;
        });
        return hasFullNeighbor;
    }

    unLink(direction: Directions, link: NodeLink) {
        if (!this.neighbors.has(direction) || !this.newLinksHistory.includes(direction)) return;
        if (link.isFinal()) return;
        const oldNeighbor = this.getNeighbor(direction) as BoardNode;
        this.neighbors.delete(direction);
        oldNeighbor.unLink(this.reverseDirection(direction), link);
        this.newLinksHistory = this.newLinksHistory.filter((entry) => entry !== direction);
    }
    getLink(direction: Directions): NodeLink | undefined {
        return this.neighbors.get(direction);
    }
    private getLinked(link: NodeLink): BoardNode | undefined {
        return link.getLinkedNode(this);
    }
    private cloneNeighbors(): Map<Directions, NodeLink> {
        const neighborsClone = new Map<Directions, NodeLink>();
        neighborsClone[Directions.Up] = this.neighbors.get(Directions.Up);
        neighborsClone[Directions.Down] = this.neighbors.get(Directions.Down);
        neighborsClone[Directions.Right] = this.neighbors.get(Directions.Right);
        neighborsClone[Directions.Left] = this.neighbors.get(Directions.Left);
        return neighborsClone;
    }
    private registerNewLink(targetDirection: Directions) {
        this.newLinksHistory.push(targetDirection);
    }
}
