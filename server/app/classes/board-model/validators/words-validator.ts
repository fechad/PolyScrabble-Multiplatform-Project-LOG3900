import { DICTIONARY_READER } from '@app/constants/reader-constant';

export class WordsValidator {
    private dictionaryReader;
    constructor() {
        this.dictionaryReader = DICTIONARY_READER;
    }
    isValidWords(words: string[]): boolean {
        return words.every((word) => {
            return this.dictionaryReader.hasWord(word);
        });
    }
}
