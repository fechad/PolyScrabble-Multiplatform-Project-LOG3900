/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { WordStructureTrie } from '@app/classes/Trie/structure-trie';
import { expect } from 'chai';
import { describe } from 'mocha';
import { WordsFinder } from './words-finder';

describe('WordsFinder', () => {
    let wordStructureTrie: WordStructureTrie;
    let finder: WordsFinder;
    beforeEach(() => {
        wordStructureTrie = new WordStructureTrie('bon');
        wordStructureTrie.insert('_o');
        wordStructureTrie.insert('_ou_');
        wordStructureTrie.insert('_oi_');

        finder = new WordsFinder();
    });
    it('should return expected derivatives when letters to form them are provided', () => {
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i']);
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bonsoir');
    });
    // test will fail until fix (needs to be fixed)
    it('should remove forced letters from the rack after placing them', () => {
        wordStructureTrie = new WordStructureTrie('b');
        wordStructureTrie.insert('_ns');
        wordStructureTrie.insert('_n_o');
        wordStructureTrie.insert('_n_ou_');
        wordStructureTrie.insert('_n_oi_');
        const formableWords = finder.findFormableChildren('b', wordStructureTrie.rootNode, ['s', 'j', 'o', 'u', 'r', 'i']);
        expect(formableWords).not.to.include('bons');
        expect(formableWords).not.to.include('bonjour');
        expect(formableWords).not.to.include('bonsoir');
    });
    // test will fail until fix or we will accept temporary technical debt since this one isn't game breaking
    it('should be able to use rackLetters the amount of time they are on the rack', () => {
        wordStructureTrie = new WordStructureTrie('b');
        wordStructureTrie.insert('_n____');
        const formableWords = finder.findFormableChildren('b', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i', 'n']);
        expect(formableWords).to.include('bons');
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bonsoir');
    });
    it('should return expected derivatives when underscores are provided', () => {
        wordStructureTrie = new WordStructureTrie('bon');
        wordStructureTrie.insert('____');
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i']);
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bons');
    });
    it('should return expected derivatives when missing letters are already on the board', () => {
        wordStructureTrie = new WordStructureTrie('bon');
        wordStructureTrie.insert('Jour');
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['o', 'u', 'r']);
        expect(formableWords).to.include('bonjour');
    });
    it('should not return uncomplete words', () => {
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i']);
        // Here bons is lacking the o that is present in all structures provided.
        expect(formableWords).to.not.include('bons');
    });
    it('should find words when structure has only underscores', () => {
        wordStructureTrie = new WordStructureTrie('bon');
        wordStructureTrie.insert('________________________');
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i']);
        // Here bons is lacking the o that is present in all structures provided.
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bons');
    });
    it('should find words when structure has no base', () => {
        wordStructureTrie = new WordStructureTrie('');
        wordStructureTrie.insert('_OIRE');
        const formableWords = finder.findFormableChildren('', wordStructureTrie.rootNode, ['b']);
        // Here bons is lacking the o that is present in all structures provided.
        expect(formableWords).to.include('boire');
    });
    it('should use the letters only the ammount of time it has them', () => {
        wordStructureTrie = new WordStructureTrie('');
        wordStructureTrie.insert('___e___');
        const formableWords = finder.findFormableChildren('', wordStructureTrie.rootNode, ['e', 'm', 'l', 'e', 'e']);
        expect(formableWords).to.not.include('emmelee');
    });
    it('should find the complete word needed', () => {
        wordStructureTrie = new WordStructureTrie('');
        wordStructureTrie.insert('_IL__');
        const formableWords = finder.findFormableChildren('', wordStructureTrie.rootNode, 'odgme'.split(''));
        expect(formableWords).to.include('gilde');
        expect(formableWords).to.not.include('gild');
    });
    it('should find words using the star', () => {
        wordStructureTrie = new WordStructureTrie('');
        wordStructureTrie.insert('_IL__');
        const formableWords = finder.findFormableChildren('', wordStructureTrie.rootNode, 'od*mes'.split(''));
        expect(formableWords).to.include('gilde');
        expect(formableWords).to.include('aile');
        expect(formableWords).to.not.include('gild');
    });
});
