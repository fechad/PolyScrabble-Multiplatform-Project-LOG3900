import { Player } from '@app/classes/player';
import { GoalRewards } from '@app/enums/goal-rewards';
import { GoalTitle } from '@app/enums/goal-titles';
import { GoalDescription } from './goal-descriptions';

export interface Goal {
    title: GoalTitle;
    description: GoalDescription;
    reward: GoalRewards;
    reached: boolean;
    isPublic: boolean;
    players: Player[];
}
