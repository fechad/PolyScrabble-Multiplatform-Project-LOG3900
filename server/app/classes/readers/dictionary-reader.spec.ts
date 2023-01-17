import { expect } from 'chai';
import { DictionaryReader } from './dictionary-reader';

const TEST_WORD = 'abricot';
const WORD_NOT_IN_DIC = 'WORD_NOT_IN_DIC';
const TEST_WORD_VALUE = 11;
describe('DictionaryReader tests', () => {
    const dic: DictionaryReader = new DictionaryReader();
    it('should contain the test word', () => {
        expect(dic.hasWord(TEST_WORD)).to.equals(true);
    });
    it('should assign the correct value to words', () => {
        expect(dic.getWordScore(TEST_WORD)).to.equals(TEST_WORD_VALUE);
    });
    it('should return undefined when asked for the score of a word not in the dictionary', () => {
        expect(dic.getWordScore(WORD_NOT_IN_DIC)).to.equals(undefined);
    });
});
