/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { BoardMessageContent } from '@app/enums/board-message-content';
import { PlacementDirections } from '@app/enums/placement-directions';
import { expect } from 'chai';
import { describe } from 'mocha';
import { BoardManipulator } from './board-manipulator';
import { SuccessMessageBuilder } from './handlers/success-message-builder';

describe('BoardManipulator tests', () => {
    let boardManipulator: BoardManipulator;
    const letterBank = new LetterBank();
    const letterValues = letterBank.produceValueMap();
    beforeEach(() => {
        boardManipulator = new BoardManipulator(letterValues);
    });
    it('The board should still be able to place letters after a bad placement request', () => {
        const expectedScore = 4;
        expect(
            boardManipulator.placeLetters(['n', 'e'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, PlacementDirections.Horizontal).content,
        ).to.be.equals(BoardMessageContent.CenterCaseEmpty);
        expect(
            boardManipulator.placeLetters(['n', 'e'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX, PlacementDirections.Horizontal).content,
        ).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(
                ['n', 'e'],
                DEFAULT_CENTRAL_ROW,
                CENTRAL_COLUMN_INDEX,
                PlacementDirections.Horizontal,
                expectedScore,
            ).content,
        );
    });
    it('The boardManipulator returns an invalid placement request message when asked to place empty lists', () => {
        const emptyList: string[] = [];
        expect(boardManipulator.placeLetters(emptyList, DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1).content).to.equals(
            BoardMessageContent.NoLetters,
        );
    });
    it('The boardManipulator places words using other words', () => {
        const expectedScore = 11;
        boardManipulator.placeLetters(['v', 'a'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX - 1, PlacementDirections.Horizontal);
        // We start by performing a valid placement of a valid word (there is already an a at the center)
        expect(boardManipulator.placeLetters(['g', 'u', 'e', 's'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, 'h').content).to.equals(
            SuccessMessageBuilder.elaborateSuccessMessage(['g', 'u', 'e', 's'], DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX + 1, 'h', expectedScore)
                .content,
        );
    });
});
