import { IndexationTranslator } from '@app/classes//board-model/handlers/indexation.translator';
import { BoardNode } from '@app/classes//board-model/nodes/board-node';
import { NodeStream } from '@app/classes//board-model/nodes/node-stream';
import { LetterBank } from '@app/classes//letter-bank/letter-bank';
import { SpecialCasesReader } from '@app/classes//readers/special-cases-reader';
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { CENTRAL_NODE_INDEX, DEFAULT_COLUMN_COUNT } from '@app/constants/board-constants';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { PlacementFinder } from './placement-finder';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */

const TEST_WORD = 'bon';
const TEST_LETTERS = TEST_WORD.split('');
const NODES_COUNT = 7;
const reader = new SpecialCasesReader();

describe('PlacementFinder tests', () => {
    let horizontalNodes: BoardNode[];
    let verticalNodes: BoardNode[];
    let horizontalStreamTest: NodeStream;
    // let verticalStreamTest;
    const letterBank = new LetterBank();
    const indexationTranslator = new IndexationTranslator();
    const boardManipulator = new BoardManipulator(letterBank.produceValueMap());
    let finder: PlacementFinder;
    let mainFlow: BoardNode[];

    beforeEach(() => {
        horizontalNodes = new Array<BoardNode>(NODES_COUNT);
        verticalNodes = new Array<BoardNode>(NODES_COUNT);

        horizontalNodes[0] = new BoardNode(0, reader.getSpecialCaseInfo(0));
        horizontalNodes[0].setLetter(TEST_LETTERS.at(0) as string);

        verticalNodes[0] = new BoardNode(0, reader.getSpecialCaseInfo(0));
        verticalNodes[0].setLetter(TEST_LETTERS.at(0) as string);

        for (let i = 1; i < NODES_COUNT; i++) {
            horizontalNodes[i] = new BoardNode(i, reader.getSpecialCaseInfo(0));
            if (i < 3) horizontalNodes[i].setLetter(TEST_LETTERS.at(i) as string);
            horizontalNodes[i].registerNeighbor(horizontalNodes[i - 1], Directions.Left);
            horizontalNodes[i - 1].registerNeighbor(horizontalNodes[i], Directions.Right);

            verticalNodes[i] = new BoardNode(i, reader.getSpecialCaseInfo(0));
            if (i < 3) verticalNodes[i].setLetter(TEST_LETTERS.at(i) as string);
            verticalNodes[i].registerNeighbor(verticalNodes[i - 1], Directions.Up);
            verticalNodes[i - 1].registerNeighbor(verticalNodes[i], Directions.Down);
        }
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        // verticalStreamTest = new NodeStream(verticalNodes[0], PlacementDirections.Vertical, NODES_COUNT);

        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];

        finder = new PlacementFinder({
            bank: letterBank,
            translator: indexationTranslator,
            manipulator: boardManipulator,
        });
    });

    it('compiles', () => {
        (finder as any).findDirectionalPlacement(
            horizontalStreamTest as NodeStream,
            { min: 0, max: 100 },
            PlacementDirections.Horizontal,
            ['s', 'j', 'o', 'o', 'u', 'r', 'i', 'b'].join(''),
        );
    });

    it('should get the base of the flow', () => {
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('bon');

        horizontalNodes[3].setLetter('s');
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('bons');

        horizontalNodes[2].undoPlacement();
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('bo');

        horizontalNodes[0].undoPlacement();
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('');
    });

    it('should get the rest of the flow with no other flow', () => {
        const otherFlows: BoardNode[][] = [[]];
        let base = 'bon';
        const dir = PlacementDirections.Horizontal;
        const availableLetters = 'sjoourib';
        let expected = ['_', '_', '_', '_'];

        expect((finder as any).getRestOfString(mainFlow, otherFlows, base, dir, availableLetters)).to.deep.equals(expected);

        horizontalNodes[3].setLetter('s');
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        base = 'bons';
        expected = ['_', '_', '_'];
        expect((finder as any).getRestOfString(mainFlow, otherFlows, base, dir, availableLetters)).to.deep.equals(expected);

        horizontalNodes[2].undoPlacement();
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        base = 'bo';
        expected = ['_', 'S', '_', '_', '_'];
        expect((finder as any).getRestOfString(mainFlow, otherFlows, base, dir, availableLetters)).to.deep.equals(expected);

        horizontalNodes[0].undoPlacement();
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        base = '';
        expected = ['_', 'O', '_', 'S', '_', '_', '_'];
        expect((finder as any).getRestOfString(mainFlow, otherFlows, base, dir, availableLetters)).to.deep.equals(expected);
    });

    it('should tell if letters are aligned with horizontal main word', () => {
        const mainWordIsHorizontal = true;
        const index = CENTRAL_NODE_INDEX;
        let testIndex = index + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index - 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index + DEFAULT_COLUMN_COUNT + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index - DEFAULT_COLUMN_COUNT + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index + DEFAULT_COLUMN_COUNT;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(true);

        testIndex = index - DEFAULT_COLUMN_COUNT;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(true);
    });

    it('should tell if letters are aligned with vertical main word', () => {
        const mainWordIsHorizontal = false;
        const index = CENTRAL_NODE_INDEX;
        let testIndex = index + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(true);

        testIndex = index - 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(true);

        testIndex = index + DEFAULT_COLUMN_COUNT + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index - DEFAULT_COLUMN_COUNT + 1;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index + DEFAULT_COLUMN_COUNT;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);

        testIndex = index - DEFAULT_COLUMN_COUNT;
        expect((finder as any).isAligned(index, testIndex, mainWordIsHorizontal)).to.be.equals(false);
    });

    it('should get the added letters to the board from the word', () => {
        // the structure is bon____
        expect((finder as any).getLettersToPlace(mainFlow, 'boni')).to.be.equals('i');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonjour')).to.be.equals('jour');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonsoir')).to.be.equals('soir');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonzzz')).to.be.equals('zzz');

        horizontalNodes[1].undoPlacement();
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('b');
        // the structure is b_n____
        expect((finder as any).getLettersToPlace(mainFlow, 'boni')).to.be.equals('oi');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonjour')).to.be.equals('ojour');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonsoir')).to.be.equals('osoir');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonzzz')).to.be.equals('ozzz');

        horizontalNodes[3].setLetter('s');
        horizontalStreamTest = new NodeStream(horizontalNodes[0], PlacementDirections.Horizontal, NODES_COUNT);
        mainFlow = (horizontalStreamTest.getFlows(PlacementDirections.Horizontal) as BoardNode[][])[0];
        expect((finder as any).getBaseFromFlow(mainFlow)).to.be.equals('b');
        // the structure is b_ns___
        expect((finder as any).getLettersToPlace(mainFlow, 'bons')).to.be.equals('o');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonsoir')).to.be.equals('ooir');
        expect((finder as any).getLettersToPlace(mainFlow, 'bonszz')).to.be.equals('ozz');
    });
});
