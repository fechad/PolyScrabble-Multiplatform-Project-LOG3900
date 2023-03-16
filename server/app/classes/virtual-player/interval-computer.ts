import { BUFFER_WORD_SEARCH, SCALES } from '@app/constants/virtual-player-constants';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { ScoreInterval } from '@app/interfaces/score-interval';

export class IntervalComputer {
    isRuthless: boolean;
    private interval: ScoreInterval;
    private adaptiveScale: AdaptiveScale;
    constructor(adaptativeScale: AdaptiveScale = SCALES.default) {
        // a inverser
        this.isRuthless = false;
        this.adaptiveScale = adaptativeScale;
        this.setScoreInterval();
    }

    get scoreInterval() {
        return this.interval;
    }
    set scale(newScale: AdaptiveScale) {
        this.adaptiveScale = newScale;
    }
    setScoreInterval(gap: number = 0) {
        if (this.isRuthless || gap > 0) return this.computeInterval(gap);
        const max = Math.abs(gap) <= this.adaptiveScale.max ? this.adaptiveScale.max : this.adaptiveScale.min;
        this.interval = { min: this.adaptiveScale.min, max };
    }

    private computeInterval(gap: number): void {
        gap = Math.abs(gap);
        const min = Math.max(gap * (1 - this.adaptiveScale.lowerScale), this.adaptiveScale.min);
        const max = Math.max(gap * (1 + this.adaptiveScale.upperScale), BUFFER_WORD_SEARCH + min);
        this.interval = { min: Math.floor(min), max: Math.floor(max) };
    }
}
