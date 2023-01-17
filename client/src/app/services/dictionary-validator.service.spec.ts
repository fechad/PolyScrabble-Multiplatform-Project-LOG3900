import { TestBed } from '@angular/core/testing';
import {
    DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_NOT_FOUND,
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
import { DictionaryValidatorService } from './dictionary-validator.service';

describe('DictionaryValidatorService', () => {
    let service: DictionaryValidatorService;
    let validDictionary: Dictionary;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DictionaryValidatorService);
        validDictionary = { title: 'hey toi', description: 'hello ! Comment.', words: ['mate', 'amitié', 'Français'] };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should create the service with an empty error message', () => {
        expect(service.errorMessage).toEqual('');
    });
    describe('isDictionaryValidTests', () => {
        it('should return false when the title attribute is undefined', () => {
            const dictionary: Dictionary = { description: 'hey', words: ['mate'] } as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(TITLE_NOT_FOUND);
        });
        it('should return false when the description attribute is undefined', () => {
            const dictionary: Dictionary = { title: 'hey', words: ['mate'] } as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(DESCRIPTION_NOT_FOUND);
        });
        it('should return false when the words attribute on the interface is  undefined', () => {
            const dictionary: Dictionary = { title: 'hey', description: 'hello' } as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(WORDS_NOT_FOUND);
        });
        it('should return false when the title is not a string', () => {
            const dictionary: Dictionary = { title: 1, description: 'hello', words: ['yes'] } as unknown as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_TYPE);
        });
        it('should return false when the description is not a string', () => {
            const dictionary: Dictionary = { title: 'yessir', description: ['hello'], words: ['yes'] } as unknown as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_DESCRIPTION_TYPE);
        });
        it('should return false when the words are not a string[]', () => {
            const dictionary: Dictionary = { title: 'yessir', description: 'hello', words: 'star' } as unknown as Dictionary;
            expect(service.isDictionaryValid(dictionary)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_WORDS_TYPE);
        });
        it('should return true when provided a valid dictionary', () => {
            expect(service.isDictionaryValid(validDictionary)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
    });
    describe('isTitleValid tests', () => {
        it('should return false when the title is empty', () => {
            expect(service.isTitleValid('')).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_LENGTH);
        });
        it('should return false when the title exceeds the maximal length', () => {
            const title = 'a'.repeat(TITLE_MAX_LENGTH + 1);
            expect(service.isTitleValid(title)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_LENGTH);
        });
        it('should return false when the title does not exceed the minimal length', () => {
            const title = 'a'.repeat(TITLE_MAX_LENGTH + 1);
            expect(service.isTitleValid(title)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_LENGTH);
        });
        it('should return true when the title is valid', () => {
            service.errorMessage = 'erreur';
            const title = 'dictionnaire par défaut';
            expect(service.isTitleValid(title)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return false when the title contains special characters', () => {
            expect(service.isTitleValid('Ma mère !')).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_CONTENT);
        });
        it('should return false when the title contains only special characters', () => {
            expect(service.isTitleValid('!!!!')).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_CONTENT);
        });
        it('should return true when the title contains only letters and spaces', () => {
            service.errorMessage = 'erreur';
            expect(service.isTitleValid('Mon papa est plus fort que le tien')).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return true when the title contains only letters and spaces', () => {
            service.errorMessage = 'erreur';
            expect(service.isTitleValid("L'affaire d'une vie")).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return true when the title contains only apostrophes', () => {
            service.errorMessage = 'erreur';
            expect(service.isTitleValid("''''''''")).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return true when the title contains a lot of special characters', () => {
            service.errorMessage = 'erreur';
            expect(service.isTitleValid("Un test bien pénible ça'")).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return false when the title contain only spaces', () => {
            expect(service.isTitleValid('        ')).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_LENGTH);
        });
        it('should return true when the size of a trimmed title equals the minimum length', () => {
            service.errorMessage = 'error';
            const title = `   ${'a'.repeat(TITLE_MIN_LENGTH)}     `;
            expect(service.isTitleValid(title)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return false when the size of a trimmed title is lower than the minimum length', () => {
            const title = `   ${'a'.repeat(TITLE_MIN_LENGTH - 1)}     `;
            expect(service.isTitleValid(title)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_TITLE_LENGTH);
        });
        it('should return true when a title has a valid length an no spaces', () => {
            service.errorMessage = 'error';
            const title = 'a'.repeat(TITLE_MIN_LENGTH);
            expect(service.isTitleValid(title)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
    });
    describe('areWordsValid tests', () => {
        it('should return false when a word has a non alpha character', () => {
            const words: string[] = ['hello', '!hey'];
            expect(service.areWordsValid(words)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_WORD_CONTENT);
        });
        it('should return false when a word is empty', () => {
            const words: string[] = ['hello', ''];
            expect(service.areWordsValid(words)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_WORD_CONTENT);
        });
        it('should return false when a word contains a space', () => {
            const words: string[] = ['hello', 'une balle'];
            expect(service.areWordsValid(words)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_WORD_CONTENT);
        });
        it('should return true when all the words are valid', () => {
            service.errorMessage = 'error';
            const words: string[] = ['hello', 'you'];
            expect(service.areWordsValid(words)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return true when some words contain accents', () => {
            service.errorMessage = '';
            const words: string[] = ['liberté', 'français', 'ño'];
            expect(service.areWordsValid(words)).toBeTrue();
            expect(service.errorMessage).toEqual('');
        });
        it('should return false when there is no words', () => {
            const words: string[] = [];
            expect(service.areWordsValid(words)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_NUMBER_OF_WORDS);
        });
        it('should return false when at least one word is not a string', () => {
            const words: string[] = ['hello', 'you', 1 as unknown as string];
            expect(service.areWordsValid(words)).toBeFalse();
            expect(service.errorMessage).toEqual(INVALID_WORD_TYPE);
        });
    });

    describe('isDescriptionValid', () => {
        it('should return true when the description is empty', () => {
            expect(service.isDescriptionValid('')).toBeTrue();
        });
        it('should return false when the length of the description is too big', () => {
            expect(service.isDescriptionValid('a'.repeat(DESCRIPTION_MAX_LENGTH + 1))).toBeFalse();
        });
        it('should return true when the length of the description is not empty', () => {
            expect(service.isDescriptionValid('a')).toBeTrue();
        });
    });
});
