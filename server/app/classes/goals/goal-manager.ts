import { Player } from '@app/classes/player';
import { Randomiser } from '@app/classes/randomiser';
import { GoalTitle } from '@app/enums/goal-titles';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { Goal } from './goal';
import { DEFAULT_GOALS, PUBLIC_GOAL_COUNT, TARGET_GOAL_COUNT } from './goals-constants';
import { Matcher } from './matcher';

const PALINDROME_MULTIPLIER = 2;
export class GoalManager {
    managerId: number;
    goalsReached: ReachedGoal[];
    private goals: Goal[];

    constructor() {
        this.goalsReached = [];
        this.goals = [];
        DEFAULT_GOALS.forEach((goal) => {
            this.goals.push({ ...goal });
        });
        this.selectGoals();
        this.shuffleGoals();
        this.managerId = Matcher.registerManager(this);
    }

    assignPublicGoals(players: Player[]) {
        let publicCount = 0;
        this.goals.forEach((goal) => {
            if (publicCount >= PUBLIC_GOAL_COUNT) return;
            if (goal.players.length !== 0) return;
            goal.players = players;
            players.forEach((player) => (player.managerId = this.managerId));
            publicCount++;
        });
    }

    assignPrivateGoal(player: Player) {
        if (this.hasPrivateGoal(player)) return;
        if (!this.canFetchGoal()) return;
        const goal = this.fetchUnassignedGoals()[0];
        goal.isPublic = false;
        goal.players = [player];
        player.managerId = this.managerId;
    }

    fetchAllGoals(): Goal[] {
        return this.goals;
    }

    fetchAllPlayerGoals(player: Player): Goal[] {
        const goals: Goal[] = [];
        this.goals.forEach((goal) => {
            if (goal.players.includes(player)) goals.push(goal);
        });
        return goals;
    }

    fetchPlayerGoalsByExposure(player: Player, isPublic: boolean): Goal[] {
        return this.fetchAllPlayerGoals(player).filter((goal) => goal.isPublic === isPublic);
    }

    registerGoalAchievement(goalTitle: GoalTitle, achiever: Player, wordPoints?: number) {
        if (this.fetchGoalByTitle(goalTitle) === undefined) return;

        const goal = this.fetchGoalByTitle(goalTitle) as Goal;
        if (goal.reached) return;
        if (!goal.players.includes(achiever)) return;
        this.goalsReached.push({ title: goalTitle, playerName: achiever.pseudo, communicated: false, reward: goal.reward });
        goal.reached = true;
        this.rewardPlayer(achiever, goalTitle, goal.reward, wordPoints);
    }
    private canFetchGoal(): boolean {
        return this.fetchUnassignedGoals() !== undefined && this.fetchUnassignedGoals().length > 0;
    }
    private rewardPlayer(achiever: Player, goalTitle: GoalTitle, reward: number, wordPoints?: number) {
        achiever.points += wordPoints && goalTitle === GoalTitle.Palindrome ? this.computePalindromeReward(wordPoints as number) : reward;
    }
    private computePalindromeReward(wordPoints: number): number {
        return wordPoints * PALINDROME_MULTIPLIER - wordPoints;
    }
    private fetchGoalByTitle(goalTitle: GoalTitle): Goal | undefined {
        return this.goals.find((goal) => goal.title === goalTitle);
    }
    private hasPrivateGoal(player: Player): boolean {
        return this.fetchPlayerGoalsByExposure(player, false).length > 0;
    }

    private fetchUnassignedGoals(): Goal[] {
        return this.goals.filter((goal) => goal.players.length === 0);
    }

    private removeGoal(goal: Goal) {
        this.goals.splice(this.goals.indexOf(goal), 1);
    }
    private selectGoals() {
        while (this.canSelectGoal()) {
            this.removeRandomGoal();
        }
    }
    private canSelectGoal(): boolean {
        return this.goals.length > TARGET_GOAL_COUNT && this.goals.length !== 0;
    }
    private removeRandomGoal() {
        const goal: Goal = Randomiser.getRandomValue(this.goals) as Goal;
        this.removeGoal(goal);
    }
    private shuffleGoals() {
        const shuffled: Goal[] = [];
        while (this.goals.length > 0) {
            const goal = Randomiser.getRandomValue(this.goals) as Goal;
            shuffled.push(goal);
            this.removeGoal(goal);
        }
        this.goals = shuffled;
    }
}
