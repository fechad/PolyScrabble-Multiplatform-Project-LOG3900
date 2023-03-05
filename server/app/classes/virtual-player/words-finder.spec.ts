import { WordStructureTrie } from '@app/classes/Trie/structure-trie';
import { Trie } from '@app/classes/Trie/trie';
import { expect } from 'chai';
import { describe } from 'mocha';
import { WordsFinder } from './words-finder';

describe('WordsFinder', () => {
    let trie: Trie;
    let wordStructureTrie: WordStructureTrie;
    let finder: WordsFinder;
    beforeEach(() => {
        trie = new Trie();
        wordStructureTrie = new WordStructureTrie('bon');
        wordStructureTrie.insert('_o');
        wordStructureTrie.insert('_ou_');
        wordStructureTrie.insert('_oi_');

        trie.insert('bonjour');
        trie.insert('bons');
        trie.insert('bonsoir');

        finder = new WordsFinder(trie);
    });
    it('should return expected derivatives when letters to form them are provided', () => {
        const formableWords = finder.findFormableChildren('bon', wordStructureTrie.rootNode, ['s', 'j', 'o', 'o', 'u', 'r', 'i']);
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bonsoir');
    });
    it('should return expected derivatives when missing letters are already on the board', () => {
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
        expect(formableWords).to.include('bonsoir');
        expect(formableWords).to.include('bons');
    });
    it('should find words when structure has no base', () => {
        wordStructureTrie = new WordStructureTrie('');
        trie.insert('boir');
        wordStructureTrie.insert('_OIR');
        const formableWords = finder.findFormableChildren('', wordStructureTrie.rootNode, ['b']);
        // Here bons is lacking the o that is present in all structures provided.
        expect(formableWords).to.include('boir');
    });
});