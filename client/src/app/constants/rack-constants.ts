/* eslint-disable @typescript-eslint/no-magic-numbers */ // Disabling magic numbers since it is a constant file

import { Colors } from '@app/enums/colors';
import { DEFAULT_WIDTH } from './board-constants';
import { DEFAULT_HEIGHT } from './constants';

export const DEFAULT_TILE_COLOR = Colors.DefaultRackTileColor;
export const DEFAULT_TILE_LETTER_COLOR = Colors.Black;
export const DEFAULT_TILE_BORDER_COLOR = Colors.DefaultRackBorderColor;
export const DEFAULT_TILE_LINE_WIDTH = 2;
export const DEFAULT_TILE_TEXT_ALIGN = 'center';
export const DEFAULT_TILE_TEXT_BASELINE = 'middle';

export const RACK_SCALING_RATIO = 2;
export const RACK_CAPACITY = 7;

export const DEFAULT_RACK_WIDTH = DEFAULT_WIDTH * 0.5;
export const DEFAULT_RACK_HEIGHT = DEFAULT_HEIGHT * (1 / 8);
export const DEFAULT_STARTING_POSITION = 0;
export const HEIGHT_SCALING_RATIO = 1;
export const DEFAULT_TILE_WIDTH = DEFAULT_RACK_WIDTH / RACK_CAPACITY;
export const DEFAULT_TILE_HEIGHT = DEFAULT_RACK_HEIGHT * HEIGHT_SCALING_RATIO;

export const ERROR = -1;

export const POINTS: number[] = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 10, 1, 2, 1, 1, 3, 8, 1, 1, 1, 1, 4, 10, 10, 10, 10];
