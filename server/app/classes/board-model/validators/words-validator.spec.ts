import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { WordsValidator } from '@app/classes/board-model/validators/words-validator';
import { SpecialCasesReader } from '@app/classes/readers/special-cases-reader';
import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { describe } from 'mocha';

const HORIZONTAL_TEST_WORD = 'abondant';
const HORIZONTAL_TEST_LETTERS = HORIZONTAL_TEST_WORD.split('');
const HORIZONTAL_NODES_COUNT = HORIZONTAL_TEST_LETTERS.length;

const VERTICAL_TEST_WORD = 'bebe';
const VERTICAL_TEST_LETTERS = VERTICAL_TEST_WORD.split('');
const VERTICAL_NODES_COUNT = VERTICAL_TEST_LETTERS.length;
describe('WordsValidator tests', () => {
    let nodes: BoardNode[];
    const reader = new SpecialCasesReader();
    const validator = new WordsValidator();

    beforeEach(() => {
        nodes = new Array<BoardNode>(HORIZONTAL_NODES_COUNT + VERTICAL_NODES_COUNT);
        nodes[0] = new BoardNode(HORIZONTAL_TEST_LETTERS[0], 0, reader.getSpecialCaseInfo(0));
        for (let i = 1; i < HORIZONTAL_NODES_COUNT; i++) {
            nodes[i] = new BoardNode(HORIZONTAL_TEST_LETTERS[i], i, reader.getSpecialCaseInfo(0));
            nodes[i].registerNeighbor(nodes[i - 1], Directions.Left);
        }
        nodes[HORIZONTAL_NODES_COUNT] = new BoardNode(
            VERTICAL_TEST_LETTERS[HORIZONTAL_NODES_COUNT - 1],
            HORIZONTAL_NODES_COUNT,
            reader.getSpecialCaseInfo(0),
        );
        for (let j = HORIZONTAL_NODES_COUNT; j < HORIZONTAL_NODES_COUNT + VERTICAL_NODES_COUNT; j++) {
            nodes[j] = new BoardNode(VERTICAL_TEST_LETTERS[j - HORIZONTAL_NODES_COUNT], j, reader.getSpecialCaseInfo(0));
        }
        for (let i = HORIZONTAL_NODES_COUNT + VERTICAL_NODES_COUNT - 1; i > HORIZONTAL_NODES_COUNT; i--) {
            nodes[i].registerNeighbor(nodes[i - 1], Directions.Up);
        }
    });
    it('validate words formed should return true when words where given node is present are valid', () => {
        expect(validator.validateWordsFormed(nodes[0], PlacementDirections.Horizontal)).to.equals(true);
    });
});
