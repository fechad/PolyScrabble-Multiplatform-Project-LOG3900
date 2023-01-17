/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import {
    CENTRAL_COLUMN_INDEX,
    DEFAULT_CENTRAL_INDEX,
    DEFAULT_CENTRAL_ROW,
    DEFAULT_FIRST_ROW,
    DEFAULT_LAST_ROW,
    DEFAULT_ROWS,
    MAX_COLUMN_INDEX,
    MIN_COLUMN_INDEX,
} from '@app/constants/board-constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { BoardManipulator } from './board.manipulator';
import { SuccessMessageBuilder } from './handlers/success-message-builder';
import { BoardNode } from './nodes/board-node';

describe('BoardManipulator tests', () => {
    let boardManipulator: BoardManipulator;
    const letterBank = new LetterBank();
    const letterValues = letterBank.produceValueMap();
    beforeEach(() => {
        boardManipulator = new BoardManipulator(letterValues);
        boardManipulator.placeLetters(['b', 'o', 'n'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, 'h');
    });
    it('The board should still be able to place letters after a bad placement request', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- we need the +4 for the spacing of the test
        boardManipulator.placeLetters(['n', 'e'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 4, PlacementDirections.Horizontal);
        expect(
            boardManipulator.placeLetters(['n', 'e'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, PlacementDirections.Horizontal).content,
        ).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(['n', 'e'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, PlacementDirections.Horizontal)
                .content,
        );
    });
    // Out of bounds tests
    it('The boardManipulator does not allow the placements of letters if one of them needs to be past the vertical limit', () => {
        expect(boardManipulator.placeLetters(['a', 'b', 'r', 'i', 'c', 'o', 't'], DEFAULT_LAST_ROW, MIN_COLUMN_INDEX, 'v').content).to.equals(
            BoardMessageContent.OutOfBounds,
        );
    });
    it('The boardManipulator does not allow the placements of letters if one of them needs to be past the horizontal limit', () => {
        expect(boardManipulator.placeLetters(['a', 'b', 'r', 'i', 'c', 'o', 't'], DEFAULT_FIRST_ROW, MAX_COLUMN_INDEX, 'h').content).to.equals(
            BoardMessageContent.OutOfBounds,
        );
    });
    it('The boardManipulator skips over occupied cases when placing letters in a specific direction', () => {
        expect(boardManipulator.placeLetters(['a', 'd', 'a', 'n', 't'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX - 1, 'h').content).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(['a', 'd', 'a', 'n', 't'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX - 1, 'h').content,
        );
    });
    // First turn behavior tests
    it('The boardManipulator does not allow the placements of letters on the first turn if none of them covers center case', () => {
        boardManipulator = new BoardManipulator(letterValues);
        expect(boardManipulator.placeLetters(['a', 'b', 'r', 'i', 'c', 'o', 't'], DEFAULT_CENTRAL_ROW, MIN_COLUMN_INDEX, 'h').content).to.equals(
            BoardMessageContent.CenterCaseEmpty,
        );
    });
    // Tests of missing values requests
    it('The boardManipulator does not allow the placement of multiple letters if no direction was provided', () => {
        expect(boardManipulator.placeLetters(['b', 'r', 'i', 'c', 'o', 't'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1).content).to.equals(
            BoardMessageContent.NoDirection,
        );
    });
    it('The boardManipulator returns an invalid placement request message when asked to place empty lists', () => {
        const emptyList: string[] = [];
        expect(boardManipulator.placeLetters(emptyList, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1).content).to.equals(
            BoardMessageContent.NoLetters,
        );
    });
    // Tests of word validations
    it('The boardManipulator rejects the letters placed if they directly form an invalid word', () => {
        expect(boardManipulator.placeLetters(['t', 'b', 'r', 't', 'c', 'o', 't'], DEFAULT_FIRST_ROW, MIN_COLUMN_INDEX, 'v').content).to.equals(
            BoardMessageContent.InvalidWord,
        );
    });
    it('should restore centerIsFull after invalid first placement starting from center case', () => {
        boardManipulator = new BoardManipulator(letterValues);
        boardManipulator.placeLetters(['a', 'b', 't', 'i', 'c', 'o', 't'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, 'h');
        expect(boardManipulator.checkBoardEmpty()).to.equals(false);
    });
    it('The boardManipulator rejects the placement if the letters indirectly formed an invalid word', () => {
        // We start by performing a valid placement of a valid word (there is already an a at the center)
        boardManipulator.placeLetters(['b', 'r', 'i', 'c', 'o', 't'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, 'h');
        // Then we perform another valid placement of another valid word next to the first one
        expect(
            boardManipulator.placeLetters(['d', 'e', 'n', 't'], DEFAULT_ROWS[DEFAULT_CENTRAL_INDEX + 1], CENTRAL_COLUMN_INDEX, 'h').content,
        ).to.equals(BoardMessageContent.InvalidWord);
    });
    it('should place letters when provided valid placement arguments', () => {
        const letters = ['a', 'd', 'a', 'n', 't'];
        expect(boardManipulator.placeLetters(letters, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX - 1, 'h').content).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(letters, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX - 1, 'h').content,
        );
    });
    // Tests of special arrays
    it('should successfully place a letter if it is the only entry of the array and the other arguments are valid', () => {
        expect(boardManipulator.placeLetters(['s'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 3).content).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(['s'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 3).content,
        );
    });
    it('should successfully reject a multiple letters placement if it is not connected to previous placements', () => {
        expect(boardManipulator.placeLetters(['o', 's'], DEFAULT_FIRST_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal).content).to.equals(
            BoardMessageContent.NotConnected,
        );
    });
    it('should successfully place two consecutive valid vertical placements', () => {
        boardManipulator = new BoardManipulator(letterValues);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        boardManipulator.placeLetters(['r', 'u', 'e'], 'h', 8, PlacementDirections.Vertical);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const result = boardManipulator.placeLetters(['e'], 'h', 8, PlacementDirections.Vertical);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(result.content).to.equals(SuccessMessageBuilder.elaborateSuccessMessage(['e'], 'h', 8, PlacementDirections.Vertical).content);
    });
    it('should successfully place two consecutive valid vertical placements even with white letters', () => {
        boardManipulator = new BoardManipulator(letterValues);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        boardManipulator.placeLetters(['r', 'u', 'E'], 'h', 8, PlacementDirections.Vertical);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const result = boardManipulator.placeLetters(['e'], 'h', 8, PlacementDirections.Vertical);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(result.content).to.equals(SuccessMessageBuilder.elaborateSuccessMessage(['e'], 'h', 8, PlacementDirections.Vertical).content);
    });
    it('should successfully place two valid vertical placements even after a failed one', () => {
        boardManipulator = new BoardManipulator(letterValues);
        boardManipulator.placeLetters(['r', 'u', 'E'], 'h', 8, PlacementDirections.Vertical);

        let result = boardManipulator.placeLetters(['z', 'z', 'z'], 'h', 8, PlacementDirections.Vertical);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        result = boardManipulator.placeLetters(['e'], 'h', 8, PlacementDirections.Vertical);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(result.content).to.equals(SuccessMessageBuilder.elaborateSuccessMessage(['e'], 'h', 8, PlacementDirections.Vertical).content);
    });
    it('should not have missing links after placements', () => {
        boardManipulator = new BoardManipulator(letterValues);
        boardManipulator.placeLetters('soleil'.split(''), 'h', 8, PlacementDirections.Horizontal);

        boardManipulator.askBoardRestoration();
    });
    it('should add up points correctly when placement are adjacent', () => {
        boardManipulator = new BoardManipulator(letterValues);
        boardManipulator.placeLetters('aerant'.split(''), 'h', 8, PlacementDirections.Horizontal);
        boardManipulator.placeLetters('senez'.split(''), 'e', 13, PlacementDirections.Vertical);
        const result = boardManipulator.placeLetters('melet'.split(''), 'd', 12, PlacementDirections.Vertical);
        expect(result.score).to.equals(22);
    });
    it('askNode should return undefine row and index are not part of the board', () => {
        expect(boardManipulator.askNode('z', 20)).to.equals(undefined);
    });
    it('handle singleLetterPlacement should return the correct BoardMessage when the word formed is invalid', () => {
        expect(boardManipulator.placeLetters('z'.split(''), 'h', 8, PlacementDirections.Horizontal)).to.deep.equal({
            title: BoardMessageTitle.InvalidPlacement,
            content: BoardMessageContent.InvalidWord,
        });
    });
    describe('Phantom placement tests', () => {
        it('should remove all links after a phantom placement', () => {
            boardManipulator = new BoardManipulator(letterValues);
            boardManipulator.placeLetters('bonjour'.split(''), DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal, true);

            boardManipulator.askBoardRestoration();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- disabled to test
            (boardManipulator as any).board.table.forEach((node: BoardNode) => {
                if (node) {
                    expect(node.getNeighborsCount()).to.equals(0, 'the node ' + node.key + ' had ' + node.getNeighborsCount() + ' links');
                }
            });
        });
    });
});
