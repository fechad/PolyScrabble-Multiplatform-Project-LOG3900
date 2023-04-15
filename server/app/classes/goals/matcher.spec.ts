import { Player } from '@app/classes/player';
import { GoalTitle } from '@app/enums/goal-titles';
import { Language } from '@app/enums/language';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { GoalManager } from './goal-manager';
import { Matcher } from './matcher';

describe('Matcher tests', () => {
    it('should call the correct manager', () => {
        Matcher.goalManagers = [];
        const manager = new GoalManager(Language.French);
        const secondManager = new GoalManager(Language.French);
        const spy = sinon.spy(manager, 'registerGoalAchievement');
        const player = new Player('socketId', 'test', true);
        manager.assignPrivateGoal(player);
        player.managerId = manager.managerId;
        Matcher.notifyGoalManager(player, GoalTitle.AtLeastFive);
        expect(secondManager.managerId === manager.managerId).to.equals(false);
        expect(spy.called).to.equals(true);
    });
});
