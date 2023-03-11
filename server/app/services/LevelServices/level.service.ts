const base = 200;
const ratio = 1.05;
export class LevelService {
    static getTotalXpForLevel(targetLevel: number) {
        return Math.floor((base * (1 - Math.pow(ratio, targetLevel))) / (1 - ratio));
    }
    static getLevel(totalXP: number) {
        let left = 1;
        let right = 100;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const seriesSum = LevelService.getTotalXpForLevel(mid);
            if (seriesSum > totalXP) right = mid;
            else left = mid + 1;
        }
        return left - 1;
    }
    static getRemainingNeededXp(totalXP: number) {
        const currentLevel = LevelService.getLevel(totalXP);
        return LevelService.getTotalXpForLevel(currentLevel + 1) - totalXP;
    }
}
