import { Directions } from '@app/enums/directions';
import { MultiplierType } from '@app/enums/multiplier-type';
import { expect } from 'chai';
import { describe } from 'mocha';
import { BoardNode } from './board-node';

describe('BoardNode tests', () => {
    let node: BoardNode;
    beforeEach(() => {
        node = new BoardNode(0, { multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2 });
    });
    it('should register a neigbourgh and get it', () => {
        const neighbor: BoardNode = new BoardNode(0, { multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3 });
        expect(node.getNeighbor(Directions.Down)).to.equals(undefined);
        node.registerNeighbor(neighbor, Directions.Down);
        expect(node.getNeighbor(Directions.Down)).to.equals(neighbor);
    });
    it('should set a letter', () => {
        expect(node.content).to.equals(null);
        node.setLetter('a');
        expect(node.content).to.equals('a');
    });
    it('should set a uppercase letter', () => {
        expect(node.content).to.equals(null);
        node.setLetter('A');
        expect(node.content).to.equals('a');
    });
    it('should set a uppercase letter and get a 0 score', () => {
        expect(node.content).to.equals(null);
        node.setLetter('A');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(0);
    });
    it('should get the right score for a letter without multiplier', () => {
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(1);
    });
    it('should get the right score for a letter with letter multiplier', () => {
        node = new BoardNode(0, { multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2 });
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(2);
    });
    it('should get the regular score for a letter with word multiplier', () => {
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(1);
    });
    it('should confirm a placement', () => {
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(1);
        expect(node.isNewValue).to.equals(true);
        node.confirmPlacement();
        expect(node.content).to.equals('a');
        expect(node.isNewValue).to.equals(false);
    });
    it('should remove bonus after a placement', () => {
        node = new BoardNode(0, { multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2 });
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(2);
        expect(node.isNewValue).to.equals(true);
        node.confirmPlacement();
        expect(node.content).to.equals('a');
        expect(node.isNewValue).to.equals(false);
        expect(node.getScore()).to.equals(1);
    });
    it('should undo a placement', () => {
        expect(node.content).to.equals(null);
        expect(node.getScore()).to.equals(0);
        node.setLetter('a');
        expect(node.content).to.equals('a');
        expect(node.getScore()).to.equals(1);
        expect(node.isNewValue).to.equals(true);
        node.undoPlacement();
        expect(node.content).to.equals(null);
        expect(node.isNewValue).to.equals(false);
        expect(node.getScore()).to.equals(0);
    });
});
