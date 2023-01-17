import { GoalManager } from '@app/classes/goals/goal-manager';
import { GoalTitle } from '@app/enums/goal-titles';
import { Matcher } from '@app/classes/goals/matcher';
import { Player } from '@app/classes/player';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { BoardRewardTracker } from './board-reward-tracker';

const palindrome = 'alla';
describe('BoardRewardTracker tests', () => {
    let tracker: BoardRewardTracker;
    const player = new Player('socketId', 'test', true);
    let manager: GoalManager;
    beforeEach(() => {
        tracker = new BoardRewardTracker();
        Matcher.goalManagers = [];
        manager = new GoalManager();
        player.managerId = manager.managerId;
    });
    it('checkRewards should notify the manager for the palindrome goal ', () => {
        const managerSpy = sinon.spy(manager, 'registerGoalAchievement');
        tracker.registerFormedWord(palindrome, player);
        expect(managerSpy.calledWith(GoalTitle.Palindrome, player)).to.equals(true);
    });
    it('checkRewards should notify the manager for the three words at once goal', () => {
        const managerSpy = sinon.spy(manager, 'registerGoalAchievement');
        tracker.registerFormedWord('palindrome', player);
        tracker.registerFormedWord('palindrom', player);
        tracker.registerFormedWord('palindroe', player);
        expect(managerSpy.calledWith(GoalTitle.ThreeWordsAtOnce, player)).to.equals(true);
    });
    it('checkRewards should notify the manager for the needOr goal ', () => {
        const managerSpy = sinon.spy(manager, 'registerGoalAchievement');
        tracker.registerFormedWord('motavecOU', player);
        expect(managerSpy.calledWith(GoalTitle.NeedOr, player)).to.equals(true);
    });
    it('should notify the manager for AtLEastFive goal', () => {
        const managerSpy = sinon.spy(manager, 'registerGoalAchievement');
        tracker.checkAtLeastFive('bonus'.split(''), player);
        expect(managerSpy.calledWith(GoalTitle.AtLeastFive, player)).to.equals(true);
    });
    it('should notify the manager for ThirdTimeCharm goal', () => {
        const managerSpy = sinon.spy(manager, 'registerGoalAchievement');
        tracker.registerDirectPlacement('placement', player);
        tracker.registerDirectPlacement('placement', player);
        tracker.registerDirectPlacement('placement', player);
        expect(managerSpy.calledWith(GoalTitle.ThirdTimeCharm, player)).to.equals(true);
    });
    it('should reset the words formed history of a player correctly', () => {
        tracker.registerFormedWord('placement', player);
        tracker.resetPlayerWordsFormed(player.pseudo);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((tracker as any).wordsTracker.getWordsFormed(player.pseudo).length).to.deep.equals(0);
    });
});
