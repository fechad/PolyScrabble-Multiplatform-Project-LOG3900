import { Position } from '@app/classes/position';
import { TILE_OFFSET_RATIO } from '@app/constants/letters-board-constants';
import {
    DEFAULT_TILE_BORDER_COLOR,
    DEFAULT_TILE_COLOR,
    DEFAULT_TILE_HEIGHT,
    DEFAULT_TILE_LINE_WIDTH,
    DEFAULT_TILE_WIDTH,
    ERROR,
} from '@app/constants/rack-constants';
import { Colors } from '@app/enums/colors';
import { SelectionType } from '@app/enums/selection-type';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { Dimension } from './dimension';
import { TileBorder } from './tile-border';

export class Tile {
    isPositionSet: boolean;
    position: Position;
    dimension: Dimension;
    color: Colors;
    points: number;
    content: string;
    border: TileBorder;
    textColor?: Colors;
    private selectionType: SelectionType;

    constructor() {
        const defaultPosition: Position = { x: ERROR, y: ERROR };
        const defaultDimension: Dimension = { width: DEFAULT_TILE_WIDTH, height: DEFAULT_TILE_HEIGHT };
        this.setDefaultValues(defaultPosition, defaultDimension, '', DEFAULT_TILE_COLOR, 0);
        this.isPositionSet = false;
    }

    setDefaultValues(tilePosition: Position, dimension: Dimension, content: string, color: Colors, points?: number) {
        this.position = { x: tilePosition.x, y: tilePosition.y };
        this.dimension = { width: dimension.width, height: dimension.height };

        this.content = content;
        this.color = color;

        if (points !== undefined) {
            this.points = points;
        }

        this.border = { color: DEFAULT_TILE_BORDER_COLOR, width: DEFAULT_TILE_LINE_WIDTH };
        this.selectionType = SelectionType.UNSELECTED;
    }

    updateSelectionType(selectionType: SelectionType) {
        switch (selectionType) {
            case SelectionType.PLACEMENT:
                this.selectionType = SelectionType.PLACEMENT;
                this.border.color = Colors.Red;
                break;
            case SelectionType.EXCHANGE:
                this.selectionType = SelectionType.EXCHANGE;
                this.border.color = Colors.Green;
                break;
            case SelectionType.BOARD:
                this.selectionType = SelectionType.BOARD;
                this.border.color = Colors.Red;
                this.border.width = 2;
                this.color = Colors.Pink;
                this.updateArrowDirection();
                break;
            default:
                this.selectionType = SelectionType.UNSELECTED;
                this.border.color = DEFAULT_TILE_BORDER_COLOR;
                break;
        }
    }

    updateArrowDirection() {
        switch (this.content) {
            case RIGHT_ARROW:
                this.content = DOWN_ARROW;
                break;
            case DOWN_ARROW:
                this.content = RIGHT_ARROW;
                break;
            default:
                this.content = RIGHT_ARROW;
                break;
        }
    }

    setPosition(tilePosition: Position) {
        this.position = { x: tilePosition.x, y: tilePosition.y };
    }

    reinitializeContents() {
        this.content = '';
        this.points = ERROR;
        this.updateSelectionType(SelectionType.UNSELECTED);
    }
    hasLetter(): boolean {
        return this.content !== '' && !this.hasArrowAsContent();
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    get typeOfSelection() {
        return this.selectionType;
    }

    get width() {
        return this.dimension.width;
    }

    get height() {
        return this.dimension.height;
    }

    contains(point: Position): boolean {
        return this.isWithinXAxisRange(point.x) && this.isWithinYAxisRange(point.y);
    }
    hasArrowAsContent(): boolean {
        return this.content === RIGHT_ARROW || this.content === DOWN_ARROW;
    }

    setLetterTileParameters(tileDimension: Dimension, multiplier: number) {
        this.position.x += tileDimension.width * TILE_OFFSET_RATIO * multiplier;
        this.position.y += tileDimension.height * TILE_OFFSET_RATIO * multiplier;
        this.dimension.width -= tileDimension.width * 2 * TILE_OFFSET_RATIO * multiplier;
        this.dimension.height -= tileDimension.height * 2 * TILE_OFFSET_RATIO * multiplier;
        this.isPositionSet = multiplier === 1;
    }

    private isWithinYAxisRange(y: number): boolean {
        return y >= this.y && y <= this.y + this.height;
    }
    private isWithinXAxisRange(x: number): boolean {
        return x >= this.x && x <= this.x + this.width;
    }
}
