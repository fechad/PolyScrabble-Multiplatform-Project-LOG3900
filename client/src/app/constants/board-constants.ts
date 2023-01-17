import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { Colors } from '@app/enums/colors';
import { MultiplierType } from '@app/enums/multiplayer-type';

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const DEFAULT_ROWS: string[] = [' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];
export const DEFAULT_CASE_COUNT = 16;
export const BOARD_SCALING_RATIO = 1.5;
export const DEFAULT_WIDTH = 725;
export const DEFAULT_HEIGHT = 725;
export const DEFAULT_STARTING_POSITION = 0;

export const DEFAULT_BOARD_INDEXES_COLOR = Colors.DefaultBorderCaseColors;
export const DEFAULT_BOARD_BACKGROUND_COLOR = Colors.CaseDefault;
export const DEFAULT_BOARD_LETTER_COLOR = Colors.Gray;
export const DEFAULT_BOARD_BORDER_COLOR = Colors.White;
export const DEFAULT_BOARD_LINE_WIDTH = 0.2;
export const DEFAULT_BOARD_TEXT_ALIGN = 'center';
export const DEFAULT_BOARD_TEXT_BASELINE = 'middle';
export const DEFAULT_BOARD_LETTER_SIZE = 7.5;
export const DEFAULT_INDEX_COLOR = Colors.Black;

export const BOARD_TILE_POSITION_OFFSET_RATIO = 5;
export const BOARD_TILE_DIMENSION_OFFSET_RATIO = BOARD_TILE_POSITION_OFFSET_RATIO * 2;

export const specialCases: SpecialCaseInfo[] = [
    { position: { x: 4, y: 1 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 12, y: 1 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 7, y: 3 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 9, y: 3 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 1, y: 4 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 8, y: 4 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 15, y: 4 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 3, y: 7 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 7, y: 7 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 9, y: 7 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 13, y: 7 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 4, y: 8 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 12, y: 8 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 3, y: 9 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 7, y: 9 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 9, y: 9 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 13, y: 9 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 1, y: 12 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 8, y: 12 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 15, y: 12 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 7, y: 13 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 9, y: 13 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 4, y: 15 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 12, y: 15 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 2, color: Colors.CaseBonusLetter2 },
    { position: { x: 1, y: 1 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 8, y: 1 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 15, y: 1 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 1, y: 8 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 15, y: 8 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 1, y: 15 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 8, y: 15 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 15, y: 15 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 3, color: Colors.CaseBonusWord3 },
    { position: { x: 2, y: 2 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 3, y: 3 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 4, y: 4 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 5, y: 5 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 11, y: 5 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 12, y: 4 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 13, y: 3 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 14, y: 2 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 5, y: 11 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 4, y: 12 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 3, y: 13 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 2, y: 14 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 11, y: 11 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 12, y: 12 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 13, y: 13 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 14, y: 14 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 8, y: 8 }, multiplierType: MultiplierType.WordMultiplier, multiplierValue: 2, color: Colors.CaseBonusWord2 },
    { position: { x: 6, y: 2 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 10, y: 2 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 6, y: 6 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 10, y: 6 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 14, y: 6 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 2, y: 10 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 6, y: 10 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 10, y: 10 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 14, y: 10 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 6, y: 14 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 10, y: 14 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
    { position: { x: 2, y: 6 }, multiplierType: MultiplierType.LetterMultiplier, multiplierValue: 3, color: Colors.CaseBonusLetter3 },
];
