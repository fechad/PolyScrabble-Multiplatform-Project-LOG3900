/* eslint-disable @typescript-eslint/no-magic-numbers */ // disabling since it is a constant file

import { Randomiser } from '@app/classes/randomiser';
export const DEFAULT_DISTRIBUTION_ARRAY = [50, 100];
export const DEFAULT_WEIGHTS = [50, 50];
export const DEFAULT_DISTRIBUTION_SIZE = 10;
export const DEFAULT_DISTRIBUTION = Randomiser.getDistribution(DEFAULT_DISTRIBUTION_ARRAY, DEFAULT_WEIGHTS, DEFAULT_DISTRIBUTION_SIZE);
export const SCORE_INTERVALS = {
    any: { min: 2, max: 50 },
    hint: { min: 2, max: 25 },
    level0: { min: 2, max: 6 },
    level1: { min: 7, max: 12 },
    level2: { min: 13, max: 18 },
};
export const DEFAULT_BOTS_NAME = ['Trump', 'Zemmour', 'Legault', 'Ulrich', 'Augustin', 'Sami'];
