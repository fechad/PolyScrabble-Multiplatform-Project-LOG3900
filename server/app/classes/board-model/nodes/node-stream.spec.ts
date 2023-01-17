import { MultiplierType } from '@app/classes/classes-constants';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { SpecialCasesReader } from '@app/classes/readers/special-cases-reader';
import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
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
    const bank = new LetterBank();
    const values = bank.produceValueMap();
    beforeEach(() => {
        horizontalNodes = new Array<BoardNode>(NODES_COUNT);
        verticalNodes = new Array<BoardNode>(NODES_COUNT);

        horizontalNodes[0] = new BoardNode(TEST_LETTERS[0], 0, reader.getSpecialCaseInfo(0));
        horizontalNodes[0].value = values.get(TEST_LETTERS[0]) as number;

        verticalNodes[0] = new BoardNode(TEST_LETTERS[0], 0, reader.getSpecialCaseInfo(0));
        verticalNodes[0].value = values.get(TEST_LETTERS[0]) as number;

        for (let i = 1; i < NODES_COUNT; i++) {
            horizontalNodes[i] = new BoardNode(TEST_LETTERS[i], i, reader.getSpecialCaseInfo(0));
            horizontalNodes[i].value = values.get(TEST_LETTERS[i]) as number;
            horizontalNodes[i].registerNeighbor(horizontalNodes[i - 1], Directions.Left);

            verticalNodes[i] = horizontalNodes[i];
            verticalNodes[i].value = values.get(TEST_LETTERS[i]) as number;
            verticalNodes[i].registerNeighbor(verticalNodes[i - 1], Directions.Up);
        }
        horizontalStreamTest = new NodeStream(horizontalNodes[2]);
        verticalStreamTest = new NodeStream(verticalNodes[2]);
        horizontalStreamTest.elaborateBothFlows();
        verticalStreamTest.elaborateBothFlows();
    });
    it('should horizontally retrace nodeStream correctly', () => {
        expect(horizontalStreamTest.getFlow(PlacementDirections.Horizontal)).to.deep.equals(horizontalNodes);
    });
    it('should vertically retrace nodeStream correctly', () => {
        expect(verticalStreamTest.getFlow(PlacementDirections.Vertical)).to.deep.equals(verticalNodes);
    });
    it('should horizontally retrace words correctly', () => {
        expect(horizontalStreamTest.getWord(PlacementDirections.Horizontal)).to.equals(TEST_WORD);
    });
    it('should horizontally retrace words correctly', () => {
        expect(verticalStreamTest.getWord(PlacementDirections.Vertical)).to.equals(TEST_WORD);
    });
    it('should horizontally add up score correctly', () => {
        expect(horizontalStreamTest.getScore(PlacementDirections.Horizontal)).to.equals(BASE_VALUE);
    });
    it('should vertically add up score correctly', () => {
        expect(verticalStreamTest.getScore(PlacementDirections.Vertical)).to.equals(BASE_VALUE);
    });
    it('should return undefined when given an incorrect placement direction', () => {
        expect(horizontalStreamTest.getFirstNode('test' as PlacementDirections)).to.equals(undefined);
    });
    describe('Score retracing tests with special cases', () => {
        beforeEach(() => {
            const wordMultiplierCaseInfo: SpecialCaseInfo = { multiplierValue: 3, multiplierType: MultiplierType.WordMultiplier };
            const letterMultiplierCaseInfo: SpecialCaseInfo = { multiplierValue: 2, multiplierType: MultiplierType.LetterMultiplier };
            horizontalNodes[0].multiplierInfo = wordMultiplierCaseInfo;
            horizontalNodes[1].multiplierInfo = letterMultiplierCaseInfo;
            verticalNodes[0].multiplierInfo = wordMultiplierCaseInfo;
            verticalNodes[1].multiplierInfo = letterMultiplierCaseInfo;
        });
        it('should horizontally add up score correctly when special cases are present', () => {
            expect(horizontalStreamTest.getScore(PlacementDirections.Horizontal)).to.equals(SPECIAL_SCORE);
        });
        it('should vertically add up score correctly when special cases are present', () => {
            expect(verticalStreamTest.getScore(PlacementDirections.Vertical)).to.equals(SPECIAL_SCORE);
        });
    });
});
