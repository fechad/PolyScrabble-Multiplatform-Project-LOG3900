/* eslint-disable @typescript-eslint/no-explicit-any -- Disabling for tests */
import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { expect } from 'chai';
import { describe } from 'mocha';
import { WordFetcher } from './word-fetcher';

describe('WordFetcher test', () => {
    const dictionaryReader = new DictionaryReader();
    const DEFAULT_BASE = 'bon';
    const TARGET_WORD = 'bonjour';
    const DEFAULT_LETTERS = TARGET_WORD.replace(DEFAULT_BASE, '').split('');
    const fetcher = new WordFetcher();
    fetcher.setWordsMap(dictionaryReader.getWords());
    it('getPlacements should return all words that can be formed from the base with the available letters in the score range', () => {
        expect(fetcher.getPlacements({ min: 0, max: 100 }, DEFAULT_BASE, DEFAULT_LETTERS)).to.include(TARGET_WORD);
    });
    it('getPlacements should exclude words outside of score interval', () => {
        expect(fetcher.getPlacements({ min: -2, max: -1 }, DEFAULT_BASE, DEFAULT_LETTERS).length).to.equals(0);
    });
});
