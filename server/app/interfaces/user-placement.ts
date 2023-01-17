import { PlacementDirections } from '@app/enums/placement-directions';

export interface UserPlacement {
    row: string;
    col: number;
    direction: PlacementDirections;
    oldWord: string;
    newWord: string;
    letters: string;
    points?: number;
}
