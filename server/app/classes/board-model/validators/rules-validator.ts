import { BoardMessage } from '@app/classes/board-model/board-message';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';

export class RulesValidator {
    centerIsFull: boolean;
    centerIsFullSave: boolean;
    placedIsConnected: boolean;
    modifiedCases: Map<number, BoardNode>;
    centerCaseKey: number;
    constructor(centerCaseKey: number) {
        this.centerIsFull = false;
        this.centerIsFullSave = false;
        this.placedIsConnected = false;
        this.modifiedCases = new Map<number, BoardNode>();
        this.centerCaseKey = centerCaseKey;
    }
    resetValues() {
        this.centerIsFull = this.centerIsFullSave;
        this.modifiedCases = new Map<number, BoardNode>();
        this.placedIsConnected = false;
    }
    checkModified(nodeKey: number) {
        return this.modifiedCases.has(nodeKey);
    }
    checkConnected(node: BoardNode, direction?: PlacementDirections) {
        if (this.placedIsConnected) return;
        if (this.modifiedCases.size === 1) {
            this.placedIsConnected = node.checkHasFullNeighbor();
            return;
        }
        switch (direction) {
            case PlacementDirections.Horizontal:
                this.placedIsConnected = node.hasOtherNeighbor(Directions.Left);
                break;
            case PlacementDirections.Vertical:
                this.placedIsConnected = node.hasOtherNeighbor(Directions.Up);
                break;
            default:
                break;
        }
    }
    registerModification(node: BoardNode, direction?: PlacementDirections) {
        if (node.key === this.centerCaseKey) this.centerIsFull = true;
        this.modifiedCases.set(node.key, node.cloneNode());
        this.checkConnected(node, direction);
    }
    performValidation(placementTest?: boolean): BoardMessage {
        if (!this.centerIsFull) return { title: BoardMessageTitle.RulesBroken, content: BoardMessageContent.CenterCaseEmpty };
        if (!this.placedIsConnected) {
            if (!this.checkModified(this.centerCaseKey)) {
                return { title: BoardMessageTitle.RulesBroken, content: BoardMessageContent.NotConnected };
            }
        }
        this.centerIsFullSave = true;
        if (placementTest) return { title: BoardMessageTitle.NoRulesBroken, content: BoardMessageContent.NoRulesBroken };
        this.resetValues();
        return { title: BoardMessageTitle.NoRulesBroken, content: BoardMessageContent.NoRulesBroken };
    }
}
