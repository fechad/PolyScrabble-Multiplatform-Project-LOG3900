import { Position } from '@app/classes/position';
import { Colors } from '@app/enums/colors';
import { MultiplierType } from '@app/enums/multiplayer-type';
export interface SpecialCaseInfo {
    position: Position;
    multiplierType: MultiplierType;
    multiplierValue: number;
    color: Colors;
}
