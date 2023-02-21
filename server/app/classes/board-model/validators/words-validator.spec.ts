import { WordsValidator } from '@app/classes/board-model/validators/words-validator';
import { expect } from 'chai';
import { describe } from 'mocha';

describe('WordsValidator tests', () => {
    let validator: WordsValidator;

    beforeEach(() => {
        validator = new WordsValidator();
    });
    it('isValidWords should return true if words exist', () => {
        const testWords: string[] = ['test', 'bonjour', 'premier'];
        expect(validator.isValidWords(testWords)).to.equals(true);
    });
    it("isValidWords should return false if a word doesn't exist", () => {
        const testWords: string[] = ['test', 'bebe', 'alaacds'];
        expect(validator.isValidWords(testWords)).to.equals(false);
    });
});
