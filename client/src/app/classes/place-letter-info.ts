import { Dimension } from './dimension';
import { Position } from './position';
import { Rack } from './rack';
import { Tile } from './tile';

export interface PlaceLetterInfo {
    lettersInBoard: Tile[][];
    rack: Rack;
    tile: Tile;
    dimension: Dimension;
    letter: string;
    indexes: Position;
}
