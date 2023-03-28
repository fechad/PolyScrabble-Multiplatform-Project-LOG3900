/* eslint-disable @typescript-eslint/no-magic-numbers */ // disabling since it is a constant file

import { Randomiser } from '@app/classes/randomiser';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
export const PLACEHOLDER_LETTERS_ALREADY_PLACED = '@';
export const PLACEHOLDER_NEW_WORD_PLACED = '%';
export const DEFAULT_DISTRIBUTION_ARRAY = [50, 100];
export const DEFAULT_WEIGHTS = [50, 50];
export const DEFAULT_DISTRIBUTION_SIZE = 10;
export const MOZART_LETTERS_FOR_SPECIAL_BEHAVIOUR = 2;
export const MAX_GAP_SANTA = -10;
export const MAXIMUM_PLACEMENT_LENGTH = 7;
export const BIG_SCORE = 30;
export const EXTREME_SCORE = 50;
export const INVALID = -1;
export const DEFAULT_DISTRIBUTION = Randomiser.getDistribution(DEFAULT_DISTRIBUTION_ARRAY, DEFAULT_WEIGHTS, DEFAULT_DISTRIBUTION_SIZE);
export const SCORE_INTERVALS = {
    any: { min: 2, max: 150 },
    hint: { min: 2, max: 250 },
    default: { min: 2, max: 10 },
};
export const BUFFER_WORD_SEARCH = 5;
const DEFAULT_SCALE: AdaptiveScale = {
    min: 2,
    max: 10,
    lowerScale: 0.2,
    upperScale: 0.15,
};
const BEGINNER_SCALE: AdaptiveScale = {
    min: 2,
    max: 15,
    lowerScale: 0.2,
    upperScale: 0.15,
};
const SERENA_SCALE: AdaptiveScale = {
    min: 5,
    max: 20,
    lowerScale: 0.2,
    upperScale: 0.2,
};
const MOZART_SCALE: AdaptiveScale = {
    min: 4,
    max: 12,
    lowerScale: 0.15,
    upperScale: 0.25,
};
const SANTA_SCALE: AdaptiveScale = {
    min: 2,
    max: 10,
    lowerScale: 0.25,
    upperScale: 0.05,
};
const TRUMP_DEFAULT_SCALE: AdaptiveScale = {
    ...BEGINNER_SCALE,
};
const TRUMP_ANGRY_SCALE: AdaptiveScale = {
    min: 15,
    max: 100,
    lowerScale: 0.05,
    upperScale: 0.4,
};
const EXPERT_SCALE: AdaptiveScale = {
    min: 0,
    max: Infinity,
    lowerScale: 0.05,
    upperScale: 0.4,
};
export const TOGGLE_PREFIX = 'toggleMe';
export const SCALES = {
    default: DEFAULT_SCALE,
    beginner: BEGINNER_SCALE,
    expert: EXPERT_SCALE,
    serena: SERENA_SCALE,
    santa: SANTA_SCALE,
    mozart: MOZART_SCALE,
    defaultTrump: TRUMP_DEFAULT_SCALE,
    angryTrump: TRUMP_ANGRY_SCALE,
};
export const LOWER_GAP_INTERVAL = 10;
export const UPPER_GAP_INTERVAL = 5;
export const DEFAULT_MAX_GAP = 6;
export const DEFAULT_BOTS_NAME = ['Trump', 'Zemmour', 'Legault', 'Ulrich', 'Augustin', 'Sami'];
export const FILLER_BOT_NAMES = ['Jack', 'Niko', 'Zeoui', 'OuiOui', 'Filoulou'];
