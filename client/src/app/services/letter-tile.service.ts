import { Injectable } from '@angular/core';
import { Dimension } from '@app/classes/dimension';
import { Tile } from '@app/classes/tile';
import { ERROR } from '@app/constants/rack-constants';
import { TileService } from './tile.service';

@Injectable({
    providedIn: 'root',
})
export class LetterTileService extends TileService {
    drawLetterTile(letterTile: Tile, tileDimension: Dimension, letterRatio: number) {
        letterTile.setLetterTileParameters(tileDimension, 1);
        this.drawRectangle(letterTile);
        this.drawBorder(letterTile);
        this.drawLetter(letterTile, letterRatio);
        this.drawPoint(letterTile, letterRatio);
        letterTile.setLetterTileParameters(tileDimension, ERROR);
    }

    drawArrow(letterTile: Tile, tileDimension: Dimension, letterRatio: number) {
        letterTile.setLetterTileParameters(tileDimension, 1);
        this.drawRectangle(letterTile);
        this.drawBorder(letterTile);
        this.drawLetter(letterTile, letterRatio);
        letterTile.setLetterTileParameters(tileDimension, ERROR);
    }
}
