import { Position } from '@app/classes/position';
import { Colors } from '@app/enums/colors';
import { MultiplierType } from '@app/enums/multiplier-type';
export interface SpecialCaseInfo {
    position: Position;
    multiplierType: MultiplierType;
    multiplierValue: number;
    color: Colors;
}
