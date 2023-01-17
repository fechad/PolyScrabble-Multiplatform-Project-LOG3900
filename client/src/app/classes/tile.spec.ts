import { BOARD_SCALING_RATIO, DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/constants';
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
import { Position } from './position';
import { Tile } from './tile';

describe('Tile tests', () => {
    let tile: Tile;
    let boardTileWidth: number;
    let boardTileHeight: number;
    let letterRatio: number;
    let tileDimension: Dimension;

    beforeEach(() => {
        tile = new Tile();
        boardTileWidth = DEFAULT_WIDTH / DEFAULT_CASE_COUNT;
        boardTileHeight = DEFAULT_HEIGHT / DEFAULT_CASE_COUNT;
        letterRatio = BOARD_SCALING_RATIO;
        tileDimension = { width: boardTileWidth, height: boardTileHeight, letterRatio };
    });

    it('should create an instance', () => {
        expect(tile).toBeTruthy();
    });

    it('should have the correct default value on creation', () => {
        const expectedPosition = { x: ERROR, y: ERROR };
        const defaultTileBorder = { color: DEFAULT_TILE_BORDER_COLOR, width: DEFAULT_TILE_LINE_WIDTH };

        expect(tile.position).toEqual(expectedPosition);
        expect(tile.width).toEqual(DEFAULT_TILE_WIDTH);
        expect(tile.height).toEqual(DEFAULT_TILE_HEIGHT);
        expect(tile.color).toEqual(DEFAULT_TILE_COLOR);
        expect(tile.points).toEqual(0);
        expect(tile.content).toEqual('');
        expect(tile.border).toEqual(defaultTileBorder);
    });

    it('setDefaultValues should set values correctly', () => {
        const newWidth = 3;
        const newHeight = 4;
        const newPosition: Position = { x: 1, y: 2 };
        const newDimension: Dimension = { width: newWidth, height: newHeight };
        const newContent = 'content';
        const defaultTileBorder = { color: DEFAULT_TILE_BORDER_COLOR, width: DEFAULT_TILE_LINE_WIDTH };

        tile.setDefaultValues(newPosition, newDimension, newContent, Colors.White);
        expect(tile.position).toEqual(newPosition);
        expect(tile.width).toEqual(newWidth);
        expect(tile.height).toEqual(newHeight);
        expect(tile.content).toEqual(newContent);
        expect(tile.color).toEqual(Colors.White);
        expect(tile.border).toEqual(defaultTileBorder);
    });

    describe('updateSelectionType tests', () => {
        it('should set the border color to red when the selection type is Placement', () => {
            tile.updateSelectionType(SelectionType.PLACEMENT);
            expect(tile.typeOfSelection).toEqual(SelectionType.PLACEMENT);
            expect(tile.border.color).toEqual(Colors.Red);
        });

        it('should set the border color to green when the selection type is Exchange', () => {
            tile.updateSelectionType(SelectionType.EXCHANGE);
            expect(tile.typeOfSelection).toEqual(SelectionType.EXCHANGE);
            expect(tile.border.color).toEqual(Colors.Green);
        });

        it('should set the border color to the default value when the selection type is not Exchange or Placement', () => {
            tile.updateSelectionType(SelectionType.UNSELECTED);
            expect(tile.typeOfSelection).toEqual(SelectionType.UNSELECTED);
            expect(tile.border.color).toEqual(DEFAULT_TILE_BORDER_COLOR);
        });
    });

    describe('updateSelectionType() tests', () => {
        it('The border color when selected for Exchange should not be same as the one when selected for Placement', () => {
            tile.updateSelectionType(SelectionType.EXCHANGE);
            const exchangeColor = tile.border.color;
            tile.updateSelectionType(SelectionType.PLACEMENT);
            const placementColor = tile.border.color;
            expect(exchangeColor).not.toEqual(placementColor);
        });
        it('The border color when selected for Exchange or Placement should not be same as the one when it is Unselected', () => {
            tile.updateSelectionType(SelectionType.EXCHANGE);
            const exchangeColor = tile.border.color;
            tile.updateSelectionType(SelectionType.UNSELECTED);
            const unselectedColor = tile.border.color;
            tile.updateSelectionType(SelectionType.PLACEMENT);
            const placementColor = tile.border.color;
            expect(exchangeColor).not.toEqual(unselectedColor);
            expect(placementColor).not.toEqual(unselectedColor);
        });
        it('The border color when selected for Board should not be same as the one when it is for Placement or Exchange', () => {
            tile.updateSelectionType(SelectionType.EXCHANGE);
            const exchangeColor = tile.border.color;
            tile.updateSelectionType(SelectionType.PLACEMENT);
            const placementColor = tile.border.color;
            tile.updateSelectionType(SelectionType.BOARD);
            const boardColor = tile.border.color;
            expect(exchangeColor).not.toEqual(boardColor);
            expect(placementColor).toEqual(boardColor);
        });
    });
    describe('hasLetter() tests', () => {
        it('should return false if tile content is an arrow ', () => {
            tile.content = DOWN_ARROW;
            const hasLetter = tile.hasLetter();
            expect(hasLetter).toEqual(false);
        });
        it('should return false if tile content is empty ', () => {
            tile.content = '';
            const hasLetter = tile.hasLetter();
            expect(hasLetter).toEqual(false);
        });
    });
    describe('updateArrowDirection() tests', () => {
        it('should set content into right arrow if it is down arrow', () => {
            tile.content = DOWN_ARROW;
            tile.updateArrowDirection();
            expect(tile.content).toEqual(RIGHT_ARROW);
        });
        it('should set content into down arrow if it is right arrow', () => {
            tile.content = RIGHT_ARROW;
            tile.updateArrowDirection();
            expect(tile.content).toEqual(DOWN_ARROW);
        });
        it('should set content into right arrow if it is random content', () => {
            tile.content = 'r';
            tile.updateArrowDirection();
            expect(tile.content).toEqual(RIGHT_ARROW);
        });
    });

    it('should setPosition correctly', () => {
        const expectedPosition = { x: 2, y: 4 };
        tile.setPosition(expectedPosition);
        expect(tile.position.x).toEqual(expectedPosition.x);
        expect(tile.position.y).toEqual(expectedPosition.y);
    });
    it('reinitializeContents should set content and points correctly', () => {
        tile.content = 'random';
        tile.points = 2;
        tile.reinitializeContents();
        expect(tile.content).toEqual('');
        expect(tile.points).toEqual(ERROR);
        expect(tile.typeOfSelection).toEqual(SelectionType.UNSELECTED);
    });
    describe('setLetterTileParameters tests', () => {
        it('should set the position correctly', () => {
            const expectedXResult = tile.x + boardTileWidth * TILE_OFFSET_RATIO;
            const expectedYResult = tile.y + boardTileHeight * TILE_OFFSET_RATIO;
            tile.setLetterTileParameters(tileDimension, 1);

            expect(tile.x).toEqual(expectedXResult);
            expect(tile.y).toEqual(expectedYResult);
        });

        it('should set the dimension correctly', () => {
            const expectedWidthResult = tile.width - boardTileWidth * 2 * TILE_OFFSET_RATIO;
            const expectedHeightResult = tile.height - boardTileHeight * 2 * TILE_OFFSET_RATIO;
            tile.setLetterTileParameters(tileDimension, 1);
            expect(tile.width).toEqual(expectedWidthResult);
            expect(tile.height).toEqual(expectedHeightResult);
        });
    });
});
