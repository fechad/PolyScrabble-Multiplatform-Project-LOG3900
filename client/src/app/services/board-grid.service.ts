import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/tile';
import {
    BOARD_TILE_DIMENSION_OFFSET_RATIO,
    BOARD_TILE_POSITION_OFFSET_RATIO,
    DEFAULT_BOARD_BORDER_COLOR,
    DEFAULT_BOARD_LETTER_COLOR,
    DEFAULT_BOARD_LINE_WIDTH,
    DEFAULT_BOARD_TEXT_ALIGN,
    DEFAULT_BOARD_TEXT_BASELINE,
} from '@app/constants/board-constants';
import { TileService } from './tile.service';

@Injectable({
    providedIn: 'root',
})
export class BoardGridService extends TileService {
    gridContext: CanvasRenderingContext2D;

    drawBoardTile(tile: Tile) {
        this.drawRectangle(tile);
        this.drawBorder(tile);
    }

    drawRectangle(tile: Tile) {
        this.gridContext.fillStyle = tile.color;
        this.gridContext.fillRect(
            tile.x + DEFAULT_BOARD_LINE_WIDTH * BOARD_TILE_POSITION_OFFSET_RATIO,
            tile.y + DEFAULT_BOARD_LINE_WIDTH * BOARD_TILE_POSITION_OFFSET_RATIO,
            tile.width - DEFAULT_BOARD_LINE_WIDTH * BOARD_TILE_DIMENSION_OFFSET_RATIO,
            tile.height - DEFAULT_BOARD_LINE_WIDTH * BOARD_TILE_DIMENSION_OFFSET_RATIO,
        );
    }
    drawBoardLine(x0: number, y0: number, x1: number, y1: number) {
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = DEFAULT_BOARD_BORDER_COLOR;
        this.gridContext.lineWidth = DEFAULT_BOARD_LINE_WIDTH;
        this.gridContext.moveTo(x0, y0);
        this.gridContext.lineTo(x1, y1);
        this.gridContext.stroke();
    }
    drawBoardLetter(tile: Tile, letterSize: number) {
        this.gridContext.font = letterSize + 'px system-ui';
        this.gridContext.fillStyle = DEFAULT_BOARD_LETTER_COLOR;
        if (tile.textColor) this.gridContext.fillStyle = tile.textColor;
        this.gridContext.textAlign = DEFAULT_BOARD_TEXT_ALIGN;
        this.gridContext.textBaseline = DEFAULT_BOARD_TEXT_BASELINE;
        this.handleSpecialTile(tile, letterSize);
        this.gridContext.stroke();
    }
    private handleSpecialTile(tile: Tile, letterSize: number) {
        if (tile.content.includes(' x')) {
            const multiplier = tile.content.split('x');
            this.gridContext.fillText(multiplier[0] as string, tile.x + tile.width / 2, tile.y + tile.height / 3);
            this.gridContext.fillText('\n x' + multiplier[1], tile.x + tile.width / 2, tile.y + tile.height / 3 + letterSize);
        } else this.gridContext.fillText(tile.content.toUpperCase() as string, tile.x + tile.width / 2, tile.y + tile.height / 2);
    }
}
