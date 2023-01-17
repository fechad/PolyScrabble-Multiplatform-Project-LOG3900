import { Injectable } from '@angular/core';
import { LetterTileService } from './letter-tile.service';

@Injectable({
    providedIn: 'root',
})
export class PlacementViewTilesService extends LetterTileService {}
