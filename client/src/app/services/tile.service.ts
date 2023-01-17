import { Injectable } from '@angular/core';
import { Dimension } from '@app/classes/dimension';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';
import { TileBorder } from '@app/classes/tile-border';
import { LETTER_SIZE, POINT_OFFSET_RATIO, POINT_SIZE } from '@app/constants/letters-board-constants';
import { DEFAULT_TILE_LETTER_COLOR, DEFAULT_TILE_TEXT_ALIGN, DEFAULT_TILE_TEXT_BASELINE, POINTS } from '@app/constants/rack-constants';

const A_ASCII = 97;

@Injectable({
    providedIn: 'root',
})
export class TileService {
    gridContext: CanvasRenderingContext2D;
    removeLetterTile(letterTile: Tile, tileDimension: Dimension) {
        const positionOffset: Position = { x: 1, y: 1.5 };
        const dimensionOffset: Dimension = { width: 2, height: 3 };
        if (!this.gridContext) return;
        this.gridContext.clearRect(
            letterTile.x - positionOffset.x,
            letterTile.y - positionOffset.y,
            tileDimension.width + dimensionOffset.width,
            tileDimension.height + dimensionOffset.height,
        );
    }
    drawLetterTile(letterTile: Tile, tileDimension: Dimension, letterRatio: number) {
        this.drawRectangle(letterTile, tileDimension);
        this.drawBorder(letterTile);
        this.drawLetter(letterTile, letterRatio);
        this.drawPoint(letterTile, letterRatio);
    }
    drawRectangle(letterTile: Tile, tileDimension?: Dimension) {
        if (!this.gridContext) return;
        this.gridContext.fillStyle = letterTile.color;
        if (tileDimension && !letterTile.isPositionSet) {
            letterTile.setLetterTileParameters(tileDimension, 1);
        }
        this.gridContext.fillRect(letterTile.x, letterTile.y, letterTile.width, letterTile.height);
    }
    drawLine(startingPosition: Position, endingPosition: Position, tileBorder: TileBorder) {
        if (!this.gridContext) return;
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = tileBorder.color;
        this.gridContext.lineWidth = tileBorder.width;
        this.gridContext.moveTo(startingPosition.x, startingPosition.y);
        this.gridContext.lineTo(endingPosition.x, endingPosition.y);
        this.gridContext.stroke();
    }

    drawBorder(letterTile: Tile) {
        this.drawHorizontalBorders(letterTile);
        this.drawVerticalBorders(letterTile);
    }

    drawLetter(letterTile: Tile, letterRatio: number) {
        if (!this.gridContext) return;

        this.gridContext.font = letterRatio * LETTER_SIZE + 'px system-ui';
        this.gridContext.fillStyle = DEFAULT_TILE_LETTER_COLOR;
        this.gridContext.textAlign = DEFAULT_TILE_TEXT_ALIGN;
        this.gridContext.textBaseline = DEFAULT_TILE_TEXT_BASELINE;
        if (!letterTile.content) {
            letterTile.content = '';
        }
        const xPosition = letterTile.x + letterTile.width / 2;
        const yPosition = letterTile.y + letterTile.height / 2;
        this.gridContext.fillText(letterTile.content.toUpperCase(), xPosition, yPosition);
        this.gridContext.stroke();
    }

    drawPoint(letterTile: Tile, letterRatio: number) {
        if (!this.gridContext) return;
        if (letterTile.points < 0 || letterTile.content.includes(' ')) return;

        this.gridContext.font = letterRatio * POINT_SIZE + 'px system-ui';
        this.gridContext.fillStyle = DEFAULT_TILE_LETTER_COLOR;
        this.gridContext.textAlign = DEFAULT_TILE_TEXT_ALIGN;
        this.gridContext.textBaseline = DEFAULT_TILE_TEXT_BASELINE;

        const xPosition = letterTile.x + letterTile.width * POINT_OFFSET_RATIO;
        const yPosition = letterTile.y + letterTile.height * POINT_OFFSET_RATIO;

        this.gridContext.fillText(letterTile.points.toString(), xPosition, yPosition);
        this.gridContext.stroke();
    }

    tileScore(letter: string): number {
        if (letter === '' || letter === undefined || letter === '*') return 0;
        const normalLetter = letter;
        if (normalLetter.toLowerCase() !== normalLetter) return 0;
        return POINTS[letter.charCodeAt(0) - A_ASCII];
    }

    numberToLetter(number: number): string {
        return String.fromCharCode(A_ASCII + number - 1);
    }

    private drawHorizontalBorders(letterTile: Tile) {
        this.drawLine({ x: letterTile.x, y: letterTile.y }, { x: letterTile.x + letterTile.width, y: letterTile.y }, letterTile.border);
        this.drawLine(
            { x: letterTile.x, y: letterTile.y + letterTile.height },
            { x: letterTile.x + letterTile.width, y: letterTile.y + letterTile.height },
            letterTile.border,
        );
    }

    private drawVerticalBorders(letterTile: Tile) {
        this.drawLine({ x: letterTile.x, y: letterTile.y }, { x: letterTile.x, y: letterTile.y + letterTile.height }, letterTile.border);
        this.drawLine(
            { x: letterTile.x + letterTile.width, y: letterTile.y },
            { x: letterTile.x + letterTile.width, y: letterTile.y + letterTile.height },
            letterTile.border,
        );
    }
}
