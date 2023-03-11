/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai';
import { LevelService } from './level.service';

describe('LevelService', () => {
    const xpToLevelNine = 2205;
    const xpToLevelTen = 2515;

    it('should compute correctly total needed xp to reach a level', () => {
        const expectedLevel = 10;
        expect(LevelService.getTotalXpForLevel(expectedLevel)).to.equal(xpToLevelTen);
    });
    it('should return the correct level', () => {
        const level = LevelService.getLevel(xpToLevelTen);
        const expectedLevel = 10;
        expect(level).to.equal(expectedLevel);
    });
    it('should return the correct missing xp', () => {
        const neededXP = LevelService.getRemainingNeededXp(xpToLevelNine);
        expect(neededXP).to.equal(xpToLevelTen - xpToLevelNine);
    });
    it('should not return negative missing xp', () => {
        let totalXP = 225;
        for (let i = 1; i <= 100; i++) {
            const neededXP = LevelService.getRemainingNeededXp(totalXP);
            expect(neededXP, 'issue happened for total xp:' + totalXP).to.be.greaterThan(0);
            totalXP *= 1.05;
        }
    });
});
