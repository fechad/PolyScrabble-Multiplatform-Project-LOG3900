import { BoardNode } from '@app/classes/board-model/nodes/board-node';

export class SpecialCasesHandler {
    private toDisable: BoardNode[] = [];
    register(node: BoardNode) {
        this.toDisable.push(node);
    }
    disableCases() {
        this.toDisable.forEach((node) => {
            node.disableMultiplier();
        });
        this.toDisable = [];
    }
}
