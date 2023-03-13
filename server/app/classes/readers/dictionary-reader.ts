import { Trie } from '@app/classes/Trie/trie';
import { JsonReader } from '@app/services/json-reader.service';
import { JsonObject } from 'swagger-ui-express';

const DEFAULT_DICTIONARY = 'dictionnaire-par-defaut.json';
export class DictionaryReader {
    private static staticInstance: DictionaryReader;
    trie: Trie;
    private words: string[];
    constructor(dictionaryName: string = DEFAULT_DICTIONARY) {
        const jsonReader = new JsonReader();
        const jsonData: JsonObject = jsonReader.getData(dictionaryName);
        if (jsonData === undefined) return;
        this.words = jsonData.words;
        this.createWordsTrie();
    }

    static get instance() {
        return this.staticInstance || (this.staticInstance = new this());
    }

    getWords() {
        return this.words;
    }
    isValidWords(words: string[]): boolean {
        return words.every((word) => {
            return this.trie.check(word);
        });
    }
    private createWordsTrie() {
        if (this.trie) return;

        const trie = new Trie();
        [...this.words].forEach((word) => {
            trie.insert(word);
        });
        this.trie = trie;
    }
}
