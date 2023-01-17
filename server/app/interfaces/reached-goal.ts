import { GoalTitle } from '@app/enums/goal-titles';

export interface ReachedGoal {
    title: GoalTitle;
    playerName: string;
    reward: number;
    communicated: boolean;
}
