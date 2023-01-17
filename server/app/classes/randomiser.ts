export class Randomiser {
    static getDistribution<T>(array: T[], weights: number[], size: number): T[] {
        const elements: T[] = [];
        const sum = weights.reduce((a, b) => a + b);
        for (let i = 0; i < array.length; ++i) {
            const count = (weights[i] / sum) * size;
            for (let j = 0; j < count; ++j) {
                elements.push(array[i]);
            }
        }
        return elements;
    }
    static getRandomValue(distributionData: unknown[]) {
        const index = Math.floor(distributionData.length * Math.random());
        return distributionData[index];
    }
}
