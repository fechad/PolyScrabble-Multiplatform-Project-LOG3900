import { Command } from '@app/classes/command/abstract-command';
import { Dimension } from '@app/classes/dimension';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { A_ASCII } from '@app/constants/constants';
import { DEFAULT_TILE_COLOR, ERROR, POINTS, RACK_CAPACITY } from '@app/constants/rack-constants';
import { Colors } from '@app/enums/colors';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';

export class PlaceLetter extends Command {
    arrowDirection: string;
    isFirstPlaced: boolean;
    protected nextPlaceLetterInfo: PlaceLetterInfo;

    constructor(protected placeLetterInfo: PlaceLetterInfo, arrowDirection: string, isFirstPlaced: boolean) {
        super();
        this.arrowDirection = arrowDirection;
        this.isFirstPlaced = isFirstPlaced;
    }

    protected get letter(): string {
        return this.placeLetterInfo.letter;
    }

    protected get tile(): Tile {
        return this.placeLetterInfo.tile;
    }

    protected get dimension(): Dimension {
        return this.placeLetterInfo.dimension;
    }

    protected get rack(): Rack {
        return this.placeLetterInfo.rack;
    }

    protected get lettersInBoard(): Tile[][] {
        return this.placeLetterInfo.lettersInBoard;
    }

    protected get xIndex(): number {
        return this.placeLetterInfo.indexes.x;
    }

    protected get yIndex(): number {
        return this.placeLetterInfo.indexes.y;
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

        this.decrementNextLetterPosition();

        if (this.isFirstPlaced) {
            this.handleFirstTilePlacedCancel();
            return;
        }
    }

    forceCancel() {
        this.addLetterOnRack();
        this.tile.reinitializeContents();
    }

    decrementNextLetterPosition() {
        switch (this.arrowDirection) {
            case RIGHT_ARROW:
                this.updatePlaceLetterInfo(this.tile, Direction.Horizontal, ERROR);
                break;
            case DOWN_ARROW:
                this.updatePlaceLetterInfo(this.tile, Direction.Vertical, ERROR);
                break;
            default:
                break;
        }
    }

    protected selectNextCase() {
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

    protected handleRightArrowDirection() {
        if (this.xIndex + 1 >= DEFAULT_CASE_COUNT) return;
        const position = { x: this.xIndex + 1, y: this.yIndex };
        let nextTile = this.lettersInBoard[position.x][position.y];
        if (!nextTile) return;
        while (nextTile.content !== '') {
            position.x += 1;
            if (!this.lettersInBoard[position.x]) return;
            nextTile = this.lettersInBoard[position.x][position.y];
            if (!nextTile) return;
        }
        nextTile.updateSelectionType(SelectionType.BOARD);
        this.updatePlaceLetterInfo(nextTile, Direction.Horizontal, 1);
    }

    protected handleDownArrowDirection() {
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
    }

    protected setCancelTileSettings() {
        this.tile.border.color = Colors.Red;
        this.tile.border.width = 2;
        this.tile.color = Colors.Pink;
        this.tile.content = this.arrowDirection;
        this.tile.points = ERROR;
    }
    protected getDimensionToRemove(): Dimension {
        const removeDimension = { ...this.dimension };
        if (this.arrowDirection === RIGHT_ARROW) {
            removeDimension.width += this.dimension.width * RACK_CAPACITY;
            return removeDimension;
        }
        removeDimension.height += this.dimension.height * RACK_CAPACITY;
        return removeDimension;
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

    private setExecutionTileSettings() {
        this.tile.content = this.letter;
        this.tile.points = this.tileScore(this.letter as string);
        this.tile.color = DEFAULT_TILE_COLOR;
    }

    private tileScore(letter: string): number {
        if (letter === '' || letter === undefined || letter === '*') return 0;
        const normalLetter = letter;
        if (normalLetter.toLowerCase() !== normalLetter) return 0;
        return POINTS[letter.charCodeAt(0) - A_ASCII];
    }

    private removeLetterOnRack() {
        if (this.letter.toLowerCase() !== this.letter) {
            this.rack.removeLetter('*');
            return;
        }
        this.rack.removeLetter(this.letter);
    }

    private handleFirstTilePlacedCancel() {
        if (this.isFirstPlaced) {
            this.tile.reinitializeContents();
        }
    }

    private handleEdgePositionOnCancel() {
        if (this.isFirstPlaced) {
            this.handleFirstTilePlacedCancel();
            return;
        }
    }

    private addLetterOnRack() {
        if (this.letter.toLowerCase() !== this.letter) {
            this.rack.addLetter('*');
            return;
        }
        this.rack.addLetter(this.letter);
    }

    private removeNextLetterTile() {
        this.addLetterOnRack();
        if (!this.nextPlaceLetterInfo) return;
        this.nextPlaceLetterInfo.tile.content = '';
    }
}
