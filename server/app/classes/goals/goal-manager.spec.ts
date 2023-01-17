/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { Player } from '@app/classes/player';
import { GoalTitle } from '@app/enums/goal-titles';
import { expect } from 'chai';
import { assert } from 'console';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { Goal } from './goal';
import { GoalManager } from './goal-manager';
import { AT_LEAST_5_GOAL, NEED_OR_GOAL, NO_CHANGE_NO_PASS_GOAL, PALINDROME_GOAL, TARGET_GOAL_COUNT } from './goals-constants';
import { Matcher } from './matcher';

describe('GoalManager tests', () => {
    Matcher.goalManagers = [];
    let firstPlayer: Player;
    let secondPlayer: Player;

    it('Should have 4 goals by default after initialization', () => {
        const manager = new GoalManager();
        expect((manager as any).goals.length).to.equals(TARGET_GOAL_COUNT);
    });

    it('Should be able to create more than two GoalManagers', () => {
        let manager = new GoalManager();
        manager = new GoalManager();
        manager = new GoalManager();
        expect((manager as any).goals.length).to.equals(TARGET_GOAL_COUNT);
    });

    describe('GoalManager methods tests', () => {
        let manager: GoalManager;
        beforeEach(() => {
            Matcher.goalManagers = [];
            manager = new GoalManager();
            manager['goals'] = [{ ...AT_LEAST_5_GOAL }, { ...PALINDROME_GOAL }, { ...NEED_OR_GOAL }, { ...NO_CHANGE_NO_PASS_GOAL }];
            firstPlayer = new Player('socketId', 'pseudo1', true);
            secondPlayer = new Player('socketId', 'pseudo2', false);
        });

        it('assignPublicGoals should assign the first two public goals to the players ', () => {
            const allGoals = (manager as any).goals as Goal[];
            const publicGoals = allGoals.filter((goal) => goal.isPublic);
            const players = [firstPlayer, secondPlayer];
            manager.assignPublicGoals([firstPlayer, secondPlayer]);
            expect(publicGoals[0].players, 'First goal did not have the players assigned').to.deep.equals(players);
            expect(publicGoals[1].players, 'Second goal did not have the players assigned').to.deep.equals(players);
            expect(publicGoals[2].players, 'Third goal had the players assigned').to.not.deep.equals(players);
        });

        it('fetchGoalsByExposure should only return the goals with correct exposure', () => {
            Matcher.goalManagers = [];
            Matcher.registerManager(manager);
            const allGoals = (manager as any).goals as Goal[];
            allGoals[0].isPublic = false;
            allGoals[0].players = [firstPlayer];
            allGoals[1].players = [firstPlayer];
            allGoals[1].isPublic = true;
            expect(manager.fetchPlayerGoalsByExposure(firstPlayer, false)[0]).to.deep.equals(allGoals[0]);
            expect(manager.fetchPlayerGoalsByExposure(firstPlayer, true)[0]).to.deep.equals(allGoals[1]);
        });

        describe('assignPrivateGoal tests', () => {
            it('should not assign more than one private goal', () => {
                manager.assignPrivateGoal(firstPlayer);
                manager.assignPrivateGoal(firstPlayer);

                const allGoals = (manager as any).goals as Goal[];
                const privateGoal = allGoals.filter((goal) => !goal.isPublic && goal.players.includes(firstPlayer));
                expect(privateGoal.length).to.equal(1);
            });

            it('should set the goal to false on assignPrivateGoal', () => {
                manager.assignPrivateGoal(firstPlayer);
                const allGoals = (manager as any).goals as Goal[];
                const privateGoal = allGoals.filter((goal) => !goal.isPublic)[0];
                expect(privateGoal.isPublic, 'privateGoal was not private').to.deep.equal(false);
                expect(privateGoal.players, 'privateGoal did not have correct player array').to.deep.equal([firstPlayer]);
            });

            it('should not let two player have the same goal', () => {
                (manager as any).goals = [{ ...AT_LEAST_5_GOAL }];
                manager.assignPrivateGoal(firstPlayer);
                manager.assignPrivateGoal(secondPlayer);

                const allGoals = (manager as any).goals as Goal[];
                const privateGoal = allGoals.filter((goal) => !goal.isPublic)[0];
                expect(privateGoal.players.length).to.equal(1);
                expect(privateGoal.players).to.deep.equal([firstPlayer]);
            });
        });

        it('fetchAllPlayerGoals should fetch all goals assigned to a specific player ', () => {
            const allGoals = (manager as any).goals as Goal[];
            allGoals[0].players = [firstPlayer];
            allGoals[3].players = [firstPlayer];
            const firstPlayerGoals = [allGoals[0], allGoals[3]];
            const goalsFirstPlayer = manager.fetchAllPlayerGoals(firstPlayer);
            expect(goalsFirstPlayer).to.deep.equals(firstPlayerGoals);
        });

        describe('registerGoalAchievement tests', () => {
            let randomGoal: Goal;

            beforeEach(() => {
                randomGoal = manager['goals'][0];
            });

            it('should not register a goal if the title is undefined', () => {
                randomGoal.reached = false;
                manager.registerGoalAchievement('randomTitle' as GoalTitle, firstPlayer);
                expect(randomGoal.reached).to.equal(false);
            });

            it('should not reward a player if the goal is already reached', () => {
                randomGoal.reached = true;
                const rewardPlayerSpy = sinon.spy(manager as any, 'rewardPlayer');
                manager.registerGoalAchievement(randomGoal.title, firstPlayer);
                assert(rewardPlayerSpy.notCalled, 'called rewardPlayer when the goal was already reached');
            });

            it('should not reward a player if he does not have the goal', () => {
                randomGoal.reached = false;
                const oldPlayerPoint = firstPlayer.points;
                manager.registerGoalAchievement(randomGoal.title, firstPlayer);
                expect(firstPlayer.points).to.equal(oldPlayerPoint);
            });

            it('should give the correct points to the player', () => {
                randomGoal.players = [firstPlayer];
                const pointTarget = firstPlayer.points + randomGoal.reward;
                manager.registerGoalAchievement(randomGoal.title, firstPlayer);
                expect(firstPlayer.points).to.equals(pointTarget);
            });

            it('should reward the correct points for palindrome goal', () => {
                PALINDROME_GOAL.reached = false;
                manager['goals'] = [PALINDROME_GOAL];
                randomGoal = manager['goals'][0];
                randomGoal.players = [firstPlayer];
                const wordPoints = 10;
                const pointTarget = firstPlayer.points + wordPoints;
                manager.registerGoalAchievement(randomGoal.title, firstPlayer, wordPoints);
                expect(firstPlayer.points).to.equals(pointTarget);
            });
        });
    });
});
