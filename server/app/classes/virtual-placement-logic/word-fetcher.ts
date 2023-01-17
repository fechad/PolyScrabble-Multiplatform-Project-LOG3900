import { DEFAULT_DICTIONARY_PATH, ELABORATE_MAP_SUCCESS_MESSAGE } from '@app/constants/constants';
import { ReadWords } from '@app/interfaces/read-words';
import { ScoreInterval } from '@app/interfaces/score-interval';
import { JsonReader } from '@app/services/json-reader.service';
import { ScoreMapper } from './score-mapper';
import { WordCollection } from './word-collection';
import { WordConstructor } from './word-constructor';
export class WordFetcher {
    private words: Map<number, WordCollection>;

    getPlacements(score: ScoreInterval, base: string, availableLetters: string[], exclusions: string[] = []): string[] {
        let targetScore = score.min;
        let result = this.findFormableDerivatives(targetScore, base, availableLetters);
        while (targetScore < score.max) {
            targetScore++;
            result = result.concat(this.findFormableDerivatives(targetScore, base, availableLetters));
        }
        result.filter((word) => !exclusions.includes(word));
        return result;
    }

    async setWordsMap(words: Map<string, number>, fileName: string = DEFAULT_DICTIONARY_PATH) {
        await null;
        if (this.words) return;
        return new Promise((resolve) => {
            try {
                const jsonData = new Map(new JsonReader().getData(fileName).bases);
                this.words = new Map<number, WordCollection>();
                jsonData.forEach((wordsCollection: ReadWords, score: number) => {
                    this.words.set(score, new WordCollection(wordsCollection.words));
                });
            } catch {
                this.words = ScoreMapper.createMap(words);
            }
            resolve(ELABORATE_MAP_SUCCESS_MESSAGE);
        });
    }

    private findFormableDerivatives(score: number, base: string, availableLetters: string[]): string[] {
        const collection = this.fetchCollection(score);
        if (collection === undefined) return [];
        const derivatives = collection.findDerivatives(base);

        const formableDerivative: string[] = [];
        derivatives.every((word) => {
            if (WordConstructor.checkCanForm(word, base, availableLetters)) {
                formableDerivative.push(word);
                return false;
            }
            return true;
        });
        return formableDerivative;
    }

    private fetchCollection(score: number): WordCollection | undefined {
        if (!this.words.has(score)) return undefined;
        return this.words.get(score);
    }
}
