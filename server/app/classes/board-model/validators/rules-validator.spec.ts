import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { Directions } from '@app/enums/directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { RulesValidator } from './rules-validator';

const centerCase = 113;
describe('RulesValidator tests', () => {
    let validator: RulesValidator;
    let nodes: BoardNode[];
    beforeEach(() => {
        validator = new RulesValidator(centerCase);
        nodes = new Array<BoardNode>(2);
        nodes[0] = new BoardNode('', 0);
        nodes[1] = new BoardNode('', 1);
    });
    it('checkConnected should make placedIsConnected true when the first node modified already has a neighbor containing a letter ', () => {
        nodes[0].content = 'a';
        nodes[1].registerNeighbor(nodes[0], Directions.Left);
        validator.modifiedCases.set(nodes[1].key, nodes[1]);
        validator.checkConnected(nodes[1]);
        expect(validator.placedIsConnected).to.equals(true);
    });
    it('checkConnected does not modify place connected when no direction is passed and modifiedCases.size is over 1', () => {
        validator.modifiedCases.set(nodes[1].key, nodes[1]);
        validator.modifiedCases.set(nodes[0].key, nodes[0]);
        validator.checkConnected(nodes[1]);
        expect(validator.placedIsConnected).to.equals(false);
    });
    it('checkModified should return true if modifiedCases contains the case', () => {
        validator.modifiedCases.set(nodes[1].key, nodes[1]);
        expect(validator.checkModified(nodes[1].key));
    });
});
