import { BUFFER_WORD_SEARCH, SCALES } from '@app/constants/virtual-player-constants';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { ScoreInterval } from '@app/interfaces/score-interval';

export class IntervalComputer {
    isRuthless: boolean;
    private interval: ScoreInterval;
    private adaptativeScale: AdaptiveScale;
    constructor(adaptativeScale: AdaptiveScale = SCALES.default) {
        // a inverser
        this.isRuthless = false;
        this.adaptativeScale = adaptativeScale;
        this.setScoreInterval();
    }

    get scoreInterval() {
        return this.interval;
    }

    setScoreInterval(gap: number = 0) {
        if (this.isRuthless || gap > 0) return this.computeInterval(gap);
        const max = Math.abs(gap) <= this.adaptativeScale.max ? this.adaptativeScale.max : this.adaptativeScale.min;
        this.interval = { min: this.adaptativeScale.min, max };
    }

    private computeInterval(gap: number): void {
        gap = Math.abs(gap);
        const min = Math.max(gap * (1 - this.adaptativeScale.lowerScale), this.adaptativeScale.min);
        const max = Math.max(gap * (1 + this.adaptativeScale.upperScale), BUFFER_WORD_SEARCH + min);
        this.interval = { min: Math.floor(min), max: Math.floor(max) };
    }
}
