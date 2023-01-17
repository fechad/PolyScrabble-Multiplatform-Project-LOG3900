import { Injectable } from '@angular/core';
import {
    ACCEPTED_TITLE_SPECIAL_CHARACTERS,
    DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_NOT_FOUND,
    INVALID_DESCRIPTION_LENGTH,
    INVALID_DESCRIPTION_TYPE,
    INVALID_NUMBER_OF_WORDS,
    INVALID_TITLE_CONTENT,
    INVALID_TITLE_LENGTH,
    INVALID_TITLE_TYPE,
    INVALID_WORDS_TYPE,
    INVALID_WORD_CONTENT,
    INVALID_WORD_TYPE,
    TITLE_MAX_LENGTH,
    TITLE_MIN_LENGTH,
    TITLE_NOT_FOUND,
    WORDS_NOT_FOUND,
} from '@app/constants/dictionary-constant';
import { Dictionary } from '@app/interfaces/dictionary';

@Injectable({
    providedIn: 'root',
})
export class DictionaryValidatorService {
    errorMessage: string;
    constructor() {
        this.errorMessage = '';
    }
    isDictionaryValid(dictionary: Dictionary): boolean {
        this.clearErrorMessage();
        return this.dictionaryRespectsTheInterface(dictionary) && this.areDictionaryAttributesValid(dictionary);
    }

    isTitleValid(title: string): boolean {
        this.clearErrorMessage();
        const trimmedTitle = title.trim();
        if (!this.isTitleSizeValid(trimmedTitle)) {
            this.errorMessage = INVALID_TITLE_LENGTH;
            return false;
        }
        if (!this.titleHasOnlyValidCharacters(trimmedTitle)) {
            this.errorMessage = INVALID_TITLE_CONTENT;
            return false;
        }
        return true;
    }
    isDescriptionValid(description: string) {
        this.clearErrorMessage();
        if (description.length > DESCRIPTION_MAX_LENGTH) {
            this.errorMessage = INVALID_DESCRIPTION_LENGTH;
            return false;
        }
        return true;
    }

    areWordsValid(words: string[]): boolean {
        this.clearErrorMessage();
        if (!words) return false;
        if (!words.length) {
            this.errorMessage = INVALID_NUMBER_OF_WORDS;
            return false;
        }
        for (const word of words) {
            if (typeof word != 'string') {
                this.errorMessage = INVALID_WORD_TYPE;
                return false;
            }
            if (!this.isWordValid(word)) {
                this.errorMessage = INVALID_WORD_CONTENT;
                return false;
            }
        }
        return true;
    }
    private areDictionaryAttributesValid(dictionary: Dictionary): boolean {
        if (!dictionary.words) return false;
        return this.isTitleValid(dictionary.title) && this.isDescriptionValid(dictionary.description) && this.areWordsValid(dictionary.words);
    }
    private dictionaryRespectsTheInterface(dictionary: Dictionary): boolean {
        if (!dictionary.title) {
            this.errorMessage = TITLE_NOT_FOUND;
            return false;
        }
        if (typeof dictionary.title !== 'string') {
            this.errorMessage = INVALID_TITLE_TYPE;
            return false;
        }
        if (!dictionary.description) {
            this.errorMessage = DESCRIPTION_NOT_FOUND;
            return false;
        }
        if (typeof dictionary.description !== 'string') {
            this.errorMessage = INVALID_DESCRIPTION_TYPE;
            return false;
        }
        if (!dictionary.words) {
            this.errorMessage = WORDS_NOT_FOUND;
            return false;
        }
        if (!Array.isArray(dictionary.words)) {
            this.errorMessage = INVALID_WORDS_TYPE;
            return false;
        }
        return true;
    }
    private isTitleSizeValid(title: string) {
        return title.length >= TITLE_MIN_LENGTH && title.length <= TITLE_MAX_LENGTH;
    }
    private clearErrorMessage() {
        this.errorMessage = '';
    }
    private titleHasOnlyValidCharacters(text: string): boolean {
        for (const character of text) {
            if (!this.isAlphaNumeric(character) && !ACCEPTED_TITLE_SPECIAL_CHARACTERS.includes(character)) return false;
        }
        return true;
    }
    private isWordValid(word: string): boolean {
        return word.length > 0 && this.isWordAlphaNumeric(this.normalizeWord(word));
    }
    private isWordAlphaNumeric(word: string): boolean {
        for (const letter of word) {
            if (!this.isAlphaNumeric(letter)) return false;
        }
        return true;
    }
    private isAlphaNumeric(character: string) {
        return character.length === 1 && this.normalizeWord(character).match(/[a-z0-9]/i);
    }
    private normalizeWord(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
