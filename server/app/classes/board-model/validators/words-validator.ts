import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { DEFAULT_DICTIONARY_PATH } from '@app/constants/constants';

export class WordsValidator {
    private dictionaryReader;
    constructor(dictionaryName: string = DEFAULT_DICTIONARY_PATH) {
        this.dictionaryReader = new DictionaryReader(dictionaryName);
    }
    isValidWords(words: string[]): boolean {
        return words.every((word) => {
            return this.dictionaryReader.hasWord(word);
        });
    }
}
