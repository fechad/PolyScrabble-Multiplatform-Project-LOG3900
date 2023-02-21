import { SpecialCasesReader } from '@app/classes/readers/special-cases-reader';
import { Directions } from '@app/enums/directions';
import { MultiplierType } from '@app/enums/multiplier-type';
import { PlacementDirections } from '@app/enums/placement-directions';
import { SpecialCaseInfo } from '@app/interfaces/special-case-info';
import { expect } from 'chai';
import { describe } from 'mocha';
import { BoardNode } from './board-node';
import { NodeStream } from './node-stream';

const TEST_WORD = 'bonjour';
const BASE_VALUE = 16;
const TEST_LETTERS = TEST_WORD.split('');
const NODES_COUNT = TEST_LETTERS.length;
const SPECIAL_SCORE = 51;
describe('NodeStream tests', () => {
    let horizontalNodes: BoardNode[];
    let verticalNodes: BoardNode[];
    let horizontalStreamTest: NodeStream;
    let verticalStreamTest: NodeStream;
    const reader = new SpecialCasesReader();

    beforeEach(() => {
        horizontalNodes = new Array<BoardNode>(NODES_COUNT);
        verticalNodes = new Array<BoardNode>(NODES_COUNT);

        horizontalNodes[0] = new BoardNode(0, reader.getSpecialCaseInfo(0));
        horizontalNodes[0].setLetter(TEST_LETTERS.at(0) as string);

        verticalNodes[0] = new BoardNode(0, reader.getSpecialCaseInfo(0));
        verticalNodes[0].setLetter(TEST_LETTERS.at(0) as string);

        for (let i = 1; i < NODES_COUNT; i++) {
            horizontalNodes[i] = new BoardNode(i, reader.getSpecialCaseInfo(0));
            horizontalNodes[i].setLetter(TEST_LETTERS.at(i) as string);
            horizontalNodes[i].registerNeighbor(horizontalNodes[i - 1], Directions.Left);
            horizontalNodes[i - 1].registerNeighbor(horizontalNodes[i], Directions.Right);

            verticalNodes[i] = new BoardNode(i, reader.getSpecialCaseInfo(0));
            verticalNodes[i].setLetter(TEST_LETTERS.at(i) as string);
            verticalNodes[i].registerNeighbor(verticalNodes[i - 1], Directions.Up);
            verticalNodes[i - 1].registerNeighbor(verticalNodes[i], Directions.Down);
        }
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        verticalStreamTest = new NodeStream(verticalNodes[0], PlacementDirections.Vertical, NODES_COUNT);
    });
    it('should horizontally retrace nodeStream correctly', () => {
        expect(horizontalStreamTest.getFlows(PlacementDirections.Horizontal)?.at(0)).to.deep.equals(horizontalNodes);
    });
    it('should vertically retrace nodeStream correctly', () => {
        expect(verticalStreamTest.getFlows(PlacementDirections.Vertical)?.at(0)).to.deep.equals(verticalNodes);
    });
    it('should horizontally retrace words correctly', () => {
        expect(horizontalStreamTest.getWords().at(0)).to.equals(TEST_WORD);
    });
    it('should vertically retrace words correctly', () => {
        expect(verticalStreamTest.getWords().at(0)).to.equals(TEST_WORD);
    });
    it('should horizontally add up score correctly', () => {
        expect(horizontalStreamTest.getScore()).to.equals(BASE_VALUE);
    });
    it('should vertically add up score correctly', () => {
        expect(verticalStreamTest.getScore()).to.equals(BASE_VALUE);
    });
    describe('Score retracing tests with special cases', () => {
        beforeEach(() => {
            const wordMultiplierCaseInfo: SpecialCaseInfo = { multiplierValue: 3, multiplierType: MultiplierType.WordMultiplier };
            const letterMultiplierCaseInfo: SpecialCaseInfo = { multiplierValue: 2, multiplierType: MultiplierType.LetterMultiplier };
            horizontalNodes[0].multiplier = wordMultiplierCaseInfo;
            horizontalNodes[1].multiplier = letterMultiplierCaseInfo;
            verticalNodes[0].multiplier = wordMultiplierCaseInfo;
            verticalNodes[1].multiplier = letterMultiplierCaseInfo;
        });
        it('should horizontally add up score correctly when special cases are present', () => {
            expect(horizontalStreamTest.getScore()).to.equals(SPECIAL_SCORE);
        });
        it('should vertically add up score correctly when special cases are present', () => {
            expect(verticalStreamTest.getScore()).to.equals(SPECIAL_SCORE);
        });
    });
});
