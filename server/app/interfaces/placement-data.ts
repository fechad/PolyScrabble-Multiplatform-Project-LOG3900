import { PlacementDirections } from '@app/enums/placement-directions';
import { Data } from './datas';

export interface PlacementData extends Data {
    word: string;
    row: string;
    column: number;
    direction: PlacementDirections;
}
