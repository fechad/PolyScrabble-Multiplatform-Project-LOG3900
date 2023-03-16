/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SCALES } from '@app/constants/virtual-player-constants';
import { expect } from 'chai';
import { IntervalComputer } from './interval-computer';

describe('WordsFinder', () => {
    it('should return lowerWhenBehind and upperWhenBehindBounds when the score difference is 0', () => {
        const scale = { ...SCALES.default };
        const computer = new IntervalComputer(scale);
        computer.setScoreInterval(0);
        expect(computer.scoreInterval.min).to.equal(scale.min);
        expect(computer.scoreInterval.max).to.equal(scale.max);
    });

    // Pere Noel
    it('should have the right intervals for Pere Noel', () => {
        let gap = -5;
        const scale = { ...SCALES.santa };
        const computer = new IntervalComputer(scale);
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(scale.max);
        expect(computer.scoreInterval.min).to.equal(scale.min);
        gap = -20;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(SCALES.santa.min);
        expect(computer.scoreInterval.min).to.equal(SCALES.santa.min);
        gap = -100;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(SCALES.santa.min);
        expect(computer.scoreInterval.min).to.equal(SCALES.santa.min);
        gap = -2;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(SCALES.santa.max);
        expect(computer.scoreInterval.min).to.equal(SCALES.santa.min);
    });

    // Angry Trump
    it('should have the right angry Trump intervals', () => {
        let gap = 40;
        const scale = { ...SCALES.angryTrump };
        const computer = new IntervalComputer(scale);
        computer.isRuthless = true;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(56);
        expect(computer.scoreInterval.min).to.equal(38);
        gap = -16;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(22);
        expect(computer.scoreInterval.min).to.equal(15);
        gap = 2;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.min).to.equal(15);
        expect(computer.scoreInterval.max).to.equal(20);
        gap = -2;
        computer.setScoreInterval(gap);
        expect(computer.scoreInterval.max).to.equal(20);
        expect(computer.scoreInterval.min).to.equal(15);
    });
});
