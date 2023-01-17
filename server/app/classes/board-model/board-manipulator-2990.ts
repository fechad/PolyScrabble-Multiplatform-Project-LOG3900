import { Player } from '@app/classes/player';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardMessage } from './board-message';
import { BoardManipulator } from './board.manipulator';
import { BoardRewardTracker } from './handlers/board-reward-tracker';
import { DirectionHandler } from './handlers/direction-handler';
import { IndexationTranslator } from './handlers/indexation.translator';
import { NodeStream } from './nodes/node-stream';

export class BoardManipulator2990 extends BoardManipulator {
    private rewardTracker: BoardRewardTracker;
    constructor(letterValues: Map<string, number>, dictionaryName?: string) {
        super(letterValues, dictionaryName);
        this.rewardTracker = new BoardRewardTracker();
    }

    handlePlacementRequest(
        letters: string[],
        row: string,
        columnIndex: number,
        currentPlayer: Player,
        direction?: string,
        isPhantomPlacement?: boolean,
    ): BoardMessage {
        const result = super.placeLetters(letters, row, columnIndex, direction, isPhantomPlacement);
        if (result.title !== BoardMessageTitle.SuccessfulPlacement || isPhantomPlacement) return result;
        if (direction === undefined) direction = PlacementDirections.Horizontal;
        this.checkRewards(row, columnIndex, direction, currentPlayer, result.score);
        this.rewardTracker.checkAtLeastFive(letters, currentPlayer);
        this.rewardTracker.resetPlayerWordsFormed(currentPlayer.pseudo);
        return result;
    }
    private checkRewards(row: string, columnIndex: number, direction: string, currentPlayer: Player, mainPlacementPoints?: number) {
        const startNode = this.board.getNode(new IndexationTranslator().findTableIndex(row, columnIndex) as number);
        const placementDirection = DirectionHandler.getPlacementDirections(direction);
        const initialStream = new NodeStream(startNode);
        initialStream.elaborateNodesFlow(placementDirection);

        const directPlacement = initialStream.getWord(placementDirection);
        this.rewardTracker.registerDirectPlacement(directPlacement, currentPlayer, mainPlacementPoints);
        this.rewardTracker.registerFormedWord(directPlacement, currentPlayer, mainPlacementPoints);
        const reverseDirection = DirectionHandler.reversePlacementDirection(direction);

        for (const node of initialStream.getFlow(placementDirection)) {
            const nodeStream = new NodeStream(node);
            nodeStream.elaborateNodesFlow(reverseDirection);
            if (!this.checkHasNewNode(nodeStream.getFlow(reverseDirection))) continue;
            this.rewardTracker.registerFormedWord(nodeStream.getWord(reverseDirection), currentPlayer, nodeStream.getScore(reverseDirection));
        }
    }
}
