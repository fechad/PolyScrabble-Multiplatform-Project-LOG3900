import { Player } from '@app/classes/player';
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalRewards } from '@app/enums/goal-rewards';
import { GoalTitle } from '@app/enums/goal-titles';

export interface Goal {
    title: GoalTitle;
    description: GoalDescription;
    reward: GoalRewards;
    reached: boolean;
    isPublic: boolean;
    players: Player[];
}
