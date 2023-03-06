import { Trie } from '@app/classes/Trie/trie';
import { ScoreMapper } from '@app/classes/virtual-placement-logic/score-mapper';
import { JsonReader } from '@app/services/json-reader.service';
import { JsonObject } from 'swagger-ui-express';

const DEFAULT_DICTIONARY = 'dictionnaire-par-defaut.json';
export class DictionaryReader {
    trie: Trie;
    private words: Map<string, number>;
    constructor(dictionaryName: string = DEFAULT_DICTIONARY) {
        const jsonReader = new JsonReader();
        const jsonData: JsonObject = jsonReader.getData(dictionaryName);
        if (jsonData === undefined) return;
        this.words = new Map<string, number>();
        this.formWordsMap(jsonData.words);
    }
    hasWord(word: string): boolean {
        return this.words.has(word);
    }
    getWordScore(word: string): number | undefined {
        if (!this.words.has(word)) return undefined;
        return this.words.get(word);
    }
    getWords(): Map<string, number> {
        return this.words;
    }
    getWordsTrie(): Trie {
        if (this.trie) return this.trie;
        const trie = new Trie();
        [...this.words.keys()].forEach((word) => {
            trie.insert(word);
        });
        this.trie = trie;
        return trie;
    }
    private formWordsMap(words: string) {
        for (const word of words) {
            this.words.set(word, ScoreMapper.computeWordScore(word));
        }
    }
}
