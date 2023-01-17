import { ScoreInterval } from './score-interval';

export interface VirtualBasis {
    level: string;
    actions: string[];
    scoreIntervals: ScoreInterval[];
}
