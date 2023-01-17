import { MultiplierType } from '@app/classes/classes-constants';
import { NODE_TEST_COUNT, NODE_TEST_FIRST_INDEX, NODE_TEST_SECOND_INDEX } from '@app/constants/board-constants';
import { Directions } from '@app/enums/directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { BoardNode } from './board-node';

describe('BoardNode tests', () => {
    let nodes: BoardNode[];
    beforeEach(() => {
        nodes = new Array<BoardNode>(NODE_TEST_COUNT);
        for (let i = 0; i <= NODE_TEST_COUNT; i++) {
            nodes[i] = new BoardNode('a', i, { multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2 });
        }
    });
    it('cloneNode should return a node deeply equal to a node, while it does not share the same reference', () => {
        const nodeClone = nodes[0].cloneNode();
        expect(nodeClone).to.deep.equals(nodes[0]);
        nodes[0].registerNeighbor(nodes[1], Directions.Up);
        expect(nodeClone).to.not.deep.equals(nodes[0]);
    });
    it('should return the correct number of neighbors it has', () => {
        expect(nodes[NODE_TEST_FIRST_INDEX].getNeighborsCount()).to.equals(0);
    });
    it('should return true when linking to neighbor with no links', () => {
        expect(nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Down)).to.equals(true);
    });
    it('should register as up neighbor when linked to the neighbor under it', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Down);
        expect(nodes[NODE_TEST_SECOND_INDEX].getNeighbor(Directions.Up)).to.equals(nodes[NODE_TEST_FIRST_INDEX]);
    });
    it('should register as down neighbor when linked to the neighbor above it', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Up);
        expect(nodes[NODE_TEST_SECOND_INDEX].getNeighbor(Directions.Down)).to.equals(nodes[NODE_TEST_FIRST_INDEX]);
    });
    it('should register as right neighbor when linked to the neighbor to its left', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Left);
        expect(nodes[NODE_TEST_SECOND_INDEX].getNeighbor(Directions.Right)).to.equals(nodes[NODE_TEST_FIRST_INDEX]);
    });
    it('should register as left neighbor when linked to the neighbor at its right', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Right);
        expect(nodes[NODE_TEST_SECOND_INDEX].getNeighbor(Directions.Left)).to.equals(nodes[NODE_TEST_FIRST_INDEX]);
    });
    it('should not replace an existing neighbor in a given direction', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Right);
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX + 1], Directions.Right);
        expect(nodes[NODE_TEST_FIRST_INDEX].getNeighbor(Directions.Right)).to.equals(nodes[NODE_TEST_SECOND_INDEX]);
    });
    it('should not register itself as a neighbor', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_FIRST_INDEX], Directions.Right);
        expect(nodes[NODE_TEST_FIRST_INDEX].getNeighbor(Directions.Right)).to.equals(undefined);
    });
    it('should abort the registration if the node has already a neighbor in the same direction', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Down);
        nodes[NODE_TEST_SECOND_INDEX + 1].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Down);
        expect(nodes[NODE_TEST_SECOND_INDEX + 1].getNeighbor(Directions.Down)).to.equals(undefined);
    });
    it('should return true when it has neighbors in another direction than the one specified', () => {
        nodes[NODE_TEST_FIRST_INDEX].registerNeighbor(nodes[NODE_TEST_SECOND_INDEX], Directions.Right);
        expect(nodes[NODE_TEST_FIRST_INDEX].hasOtherNeighbor(Directions.Left));
    });
});
