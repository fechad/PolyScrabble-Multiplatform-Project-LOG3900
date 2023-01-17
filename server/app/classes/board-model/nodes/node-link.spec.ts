import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { BoardNode } from './board-node';
import { NodeLink } from './node-link';

describe('NodeLink tests', () => {
    it('should return undefined when provided a node not part of the link', () => {
        const firstNode = new BoardNode('first', 0);
        const secondNode = new BoardNode('second', 1);
        const thirdNode = new BoardNode('third', 3);
        const link = new NodeLink(firstNode, secondNode, PlacementDirections.Horizontal);
        expect(link.getLinkedNode(thirdNode)).to.equals(undefined);
    });
});
