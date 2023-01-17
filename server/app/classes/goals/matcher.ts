import { Player } from '@app/classes/player';
import { GoalTitle } from '@app/enums/goal-titles';
import { GoalManager } from './goal-manager';

export class Matcher {
    static goalManagers: GoalManager[];
    static notifyGoalManager(achiever: Player, goalTitle: GoalTitle, wordPoints?: number) {
        if (!this.checkRequestValidity(achiever)) return;
        this.goalManagers[achiever.managerId].registerGoalAchievement(goalTitle, achiever, wordPoints);
    }
    static registerManager(manager: GoalManager): number {
        if (this.goalManagers === undefined) this.goalManagers = [];
        if (this.goalManagers.includes(manager)) return this.goalManagers.findIndex((entry) => entry === manager);
        this.goalManagers.push(manager);
        return this.goalManagers.length - 1;
    }
    static checkRequestValidity(achiever: Player): boolean {
        if (!achiever || achiever.managerId === undefined) return false;
        if (this.checkIndexValidity(achiever.managerId)) return false;
        if (!this.goalManagers[achiever.managerId]) return false;
        return true;
    }
    static checkIndexValidity(index: number): boolean {
        return index > this.goalManagers.length - 1 || index < 0;
    }
}
