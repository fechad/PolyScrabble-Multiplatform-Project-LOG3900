import { Dimension } from '@app/classes/dimension';
import { Tile } from '@app/classes/tile';
import { ERROR } from '@app/constants/rack-constants';
import { Colors } from '@app/enums/colors';
import { SelectionType } from '@app/enums/selection-type';
import { PlaceLetter } from './place-letter';
export class PlaceDraggedLetter extends PlaceLetter {
    arrowDirection: string;
    isFirstPlaced: boolean;

    protected getDimensionToRemove(): Dimension {
        const removeDimension = { ...this.dimension };
        return removeDimension;
    }

    // for this Command, there is no next case, so we actually select the current one
    protected selectNextCase() {
        this.tile.updateSelectionType(SelectionType.BOARD);
    }

    protected handleRightArrowDirection() {
        return;
    }

    protected handleDownArrowDirection() {
        return;
    }

    protected setCancelTileSettings() {
        this.tile.border.color = Colors.Red;
        this.tile.border.width = 2;
        this.tile.color = Colors.Pink;
        this.tile.content = '';
        this.tile.points = ERROR;
    }

    // eslint-disable-next-line no-unused-vars
    protected drawArrow(letterTile: Tile) {
        return;
    }
}
