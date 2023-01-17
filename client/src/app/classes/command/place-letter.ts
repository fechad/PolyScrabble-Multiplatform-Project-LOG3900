import { Command } from '@app/classes/command/abstract-command';
import { Dimension } from '@app/classes/dimension';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { DEFAULT_TILE_COLOR, ERROR, RACK_CAPACITY } from '@app/constants/rack-constants';
import { Colors } from '@app/enums/colors';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { PlacementViewTilesService } from '@app/services/placement-view-tiles.service';
export class PlaceLetter extends Command {
    arrowDirection: string;
    isFirstPlaced: boolean;

    private nextPlaceLetterInfo: PlaceLetterInfo;
    constructor(
        private placementViewTileService: PlacementViewTilesService,
        private placeLetterInfo: PlaceLetterInfo,
        arrowDirection: string,
        isFirstPlaced: boolean,
    ) {
        super();
        this.arrowDirection = arrowDirection;
        this.isFirstPlaced = isFirstPlaced;
    }

    getNextPlaceInfo(): PlaceLetterInfo {
        return this.nextPlaceLetterInfo;
    }

    getPlaceInfo(): PlaceLetterInfo {
        return this.placeLetterInfo;
    }

    execute() {
        if (!this.tile) return;
        this.selectNextCase();
        this.setExecutionTileSettings();

        this.placementViewTileService.removeLetterTile(this.tile, this.dimension);
        this.placementViewTileService.drawLetterTile(this.tile, this.dimension, this.dimension.letterRatio as number);

        this.removeLetterOnRack();
    }

    cancel() {
        this.setCancelTileSettings();

        this.removeNextLetterTile();

        if (!this.nextPlaceLetterInfo) {
            this.handleEdgePositionOnCancel();
            this.handleFirstTilePlacedCancel();
            return;
        }

        this.placementViewTileService.removeLetterTile(this.tile, this.getDimensionToRemove());
        this.decrementNextLetterPosition();

        if (this.isFirstPlaced) {
            this.handleFirstTilePlacedCancel();
            return;
        }

        this.placementViewTileService.drawArrow(this.tile, this.dimension, this.dimension.letterRatio as number);
    }

    forceCancel() {
        this.addLetterOnRack();
        this.placementViewTileService.removeLetterTile(this.tile, this.dimension);
        this.tile.reinitializeContents();
    }

    decrementNextLetterPosition() {
        if (this.arrowDirection === RIGHT_ARROW) {
            this.updatePlaceLetterInfo(this.tile, Direction.Horizontal, ERROR);
        } else {
            this.updatePlaceLetterInfo(this.tile, Direction.Vertical, ERROR);
        }
    }

    private handleFirstTilePlacedCancel() {
        if (this.isFirstPlaced) {
            this.tile.reinitializeContents();
        }
    }

    private handleEdgePositionOnCancel() {
        if (!this.nextPlaceLetterInfo) {
            this.placementViewTileService.removeLetterTile(this.tile, this.getDimensionToRemove());
        }
        if (this.isFirstPlaced) {
            this.handleFirstTilePlacedCancel();
            return;
        }
        this.placementViewTileService.drawArrow(this.tile, this.dimension, this.dimension.letterRatio as number);
    }

    private setExecutionTileSettings() {
        this.tile.content = this.letter;
        this.tile.points = this.placementViewTileService.tileScore(this.letter as string);
        this.tile.color = DEFAULT_TILE_COLOR;
    }

    private setCancelTileSettings() {
        this.tile.border.color = Colors.Red;
        this.tile.border.width = 2;
        this.tile.color = Colors.Pink;
        this.tile.content = this.arrowDirection;
        this.tile.points = ERROR;
    }
    private getDimensionToRemove(): Dimension {
        const removeDimension = { ...this.dimension };
        if (this.arrowDirection === RIGHT_ARROW) {
            removeDimension.width += this.dimension.width * RACK_CAPACITY;
            return removeDimension;
        }
        removeDimension.height += this.dimension.height * RACK_CAPACITY;
        return removeDimension;
    }
    private addLetterOnRack() {
        if (this.letter.toLowerCase() !== this.letter) {
            this.rack.addLetter('*');
            return;
        }
        this.rack.addLetter(this.letter);
    }

    private removeLetterOnRack() {
        if (this.letter.toLowerCase() !== this.letter) {
            this.rack.removeLetter('*');
            return;
        }
        this.rack.removeLetter(this.letter);
    }

    private removeNextLetterTile() {
        this.addLetterOnRack();
        if (!this.nextPlaceLetterInfo) return;
        if (this.nextPlaceLetterInfo.tile.hasArrowAsContent()) {
            this.placementViewTileService.removeLetterTile(this.nextPlaceLetterInfo.tile, this.dimension);
        }
        this.nextPlaceLetterInfo.tile.content = '';
    }

    private selectNextCase() {
        switch (this.arrowDirection) {
            case RIGHT_ARROW:
                this.handleRightArrowDirection();
                break;
            case DOWN_ARROW:
                this.handleDownArrowDirection();
                break;
            default:
                break;
        }
    }

    private handleRightArrowDirection() {
        if (this.xIndex + 1 >= DEFAULT_CASE_COUNT) return;
        const position = { x: this.xIndex + 1, y: this.yIndex };
        let nextTile = this.lettersInBoard[position.x][position.y];
        if (!nextTile) return;
        while (nextTile.content !== '') {
            position.x += 1;
            nextTile = this.lettersInBoard[position.x][position.y];
            if (!nextTile) return;
        }
        nextTile.updateSelectionType(SelectionType.BOARD);
        this.updatePlaceLetterInfo(nextTile, Direction.Horizontal, 1);

        this.placementViewTileService.drawArrow(nextTile, this.dimension, this.dimension.letterRatio as number);
    }

    private handleDownArrowDirection() {
        if (this.yIndex + 1 >= DEFAULT_CASE_COUNT) return;
        const position = { x: this.xIndex, y: this.yIndex + 1 };
        let nextTile = this.lettersInBoard[position.x][position.y];
        if (!nextTile) return;
        while (nextTile.content !== '') {
            position.y += 1;
            nextTile = this.lettersInBoard[position.x][position.y];
            if (!nextTile) return;
        }
        nextTile.updateSelectionType(SelectionType.BOARD);
        this.updatePlaceLetterInfo(nextTile, Direction.Vertical, 1);

        this.placementViewTileService.drawArrow(nextTile, this.dimension, this.dimension.letterRatio as number);
    }

    private updatePlaceLetterInfo(nextTile: Tile, direction: Direction, step: number) {
        this.nextPlaceLetterInfo = { ...this.placeLetterInfo };
        if (direction === Direction.Horizontal) {
            this.nextPlaceLetterInfo.indexes.x += step;
            nextTile.content = RIGHT_ARROW;
        } else {
            this.nextPlaceLetterInfo.indexes.y += step;
            nextTile.content = DOWN_ARROW;
        }
        this.nextPlaceLetterInfo.tile = nextTile;
    }

    private get letter(): string {
        return this.placeLetterInfo.letter;
    }

    private get tile(): Tile {
        return this.placeLetterInfo.tile;
    }

    private get dimension(): Dimension {
        return this.placeLetterInfo.dimension;
    }

    private get rack(): Rack {
        return this.placeLetterInfo.rack;
    }

    private get lettersInBoard(): Tile[][] {
        return this.placeLetterInfo.lettersInBoard;
    }

    private get xIndex(): number {
        return this.placeLetterInfo.indexes.x;
    }

    private get yIndex(): number {
        return this.placeLetterInfo.indexes.y;
    }
}
