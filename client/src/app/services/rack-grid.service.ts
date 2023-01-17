import { Injectable } from '@angular/core';
import { TileService } from './tile.service';

@Injectable({
    providedIn: 'root',
})
export class RackGridService extends TileService {}
