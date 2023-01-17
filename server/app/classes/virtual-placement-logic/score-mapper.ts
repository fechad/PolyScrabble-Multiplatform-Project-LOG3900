import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { WordCollection } from './word-collection';
export class ScoreMapper {
    static valueMap = new LetterBank().produceValueMap();
    static formWordsMap(unmappedWords: string[]): Map<string, number> {
        const words = new Map<string, number>();
        for (const word of unmappedWords) {
            words.set(word, this.computeWordScore(word));
        }
        return words;
    }
    static computeWordScore(word: string): number {
        let score = 0;
        const letterValues = this.valueMap;
        for (const letter of word) {
            if (letterValues.get(letter)) {
                score += letterValues.get(letter) as number;
            }
        }
        return score;
    }
    static createMap(initialMap: Map<string, number>): Map<number, WordCollection> {
        const words = new Map<number, WordCollection>();
        initialMap.forEach((score, word) => {
            if (words.has(score)) words.get(score)?.add(word);
            else words.set(score, new WordCollection([word]));
        });
        return words;
    }
}
