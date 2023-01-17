import { Player } from '@app/classes/player';

export interface RewardInfo extends Player {
    points: number;
    managerId: number;
    pseudo: string;
}
