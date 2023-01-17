/* eslint-disable @typescript-eslint/no-magic-numbers -- disabling to ease testing*/
import { GoalManager } from '@app/classes/goals/goal-manager';
import { PALINDROME_GOAL } from '@app/classes/goals/goals-constants';
import { Matcher } from '@app/classes/goals/matcher';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { BoardManipulator2990 } from './board-manipulator-2990';

const palindromeWord = 'naan';
const palindromeWordScore = 8;
describe('BoardManipulator2990 tests', () => {
    const letterBank = new LetterBank();
    const letterValues = letterBank.produceValueMap();
    Matcher.goalManagers = [];
    let manager = new GoalManager();

    let board: BoardManipulator2990;
    let firstPlayer: Player;

    beforeEach(() => {
        firstPlayer = new Player('firstPlayerSocket', 'firstPlayer', true);
        board = new BoardManipulator2990(letterValues);
        const goal = PALINDROME_GOAL;
        goal.isPublic = false;
        goal.players = [firstPlayer];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (manager as any).goals = [goal];
        firstPlayer.managerId = manager.managerId;
    });
    it('should not give points for phantom placements', () => {
        const originalPoints = firstPlayer.points;
        board.handlePlacementRequest(palindromeWord.split(''), 'h', 8, firstPlayer, 'h', true);
        expect(firstPlayer.points).to.equals(originalPoints);
    });
    it('should give reward points for a regular placement', () => {
        Matcher.goalManagers = [];
        manager = new GoalManager();
        const goal = PALINDROME_GOAL;
        goal.isPublic = false;
        goal.players = [firstPlayer];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (manager as any).goals = [goal];
        firstPlayer.managerId = manager.managerId;
        const originalPoints = firstPlayer.points;
        const result = board.handlePlacementRequest(palindromeWord.split(''), 'h', 8, firstPlayer, 'h');
        firstPlayer.points += result.score as number;
        expect(result.title, 'placement did not go through').to.equals(BoardMessageTitle.SuccessfulPlacement);
        expect(firstPlayer.points).to.equals(originalPoints + palindromeWordScore * 2);
    });
    it('should call checkRewards on a regular placement result', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = sinon.spy(board as any, 'checkRewards');
        board.handlePlacementRequest(palindromeWord.split(''), 'h', 8, firstPlayer, 'h');
        expect(spy.calledOnce).to.equals(true);
    });
});
