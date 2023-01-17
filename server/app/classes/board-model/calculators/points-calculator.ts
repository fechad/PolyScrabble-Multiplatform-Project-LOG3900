import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { NodeStream } from '@app/classes/board-model/nodes/node-stream';
import { PlacementDirections } from '@app/enums/placement-directions';

export class PointsCalculator {
    static computeNewPoints(startNode: BoardNode, placementDirection: PlacementDirections): number {
        const initialStream = new NodeStream(startNode);
        initialStream.elaborateNodesFlow(placementDirection);
        const reverseDirection = DirectionHandler.reversePlacementDirection(placementDirection);
        let score = initialStream.getScore(placementDirection);

        for (const node of initialStream.getFlow(placementDirection)) {
            const nodeStream = new NodeStream(node);
            nodeStream.elaborateNodesFlow(reverseDirection);
            const previousMaxLength = node.maxStreamLength.get(reverseDirection) as number;
            if (nodeStream.getFlow(reverseDirection).length <= previousMaxLength && node !== startNode) continue;
            score += nodeStream.getScore(reverseDirection);
        }
        return score;
    }
}
