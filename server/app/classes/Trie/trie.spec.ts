import { expect } from 'chai';
import { describe } from 'mocha';
import { Trie } from './trie';

describe('Trie', () => {
    let trie = new Trie();
    beforeEach(() => {
        trie = new Trie();
    });
    it('should be able to find added words', () => {
        trie.insert('test');
        expect(trie.check('test')).to.equal(true);
    });
    it('should not validate words that were not inseted', () => {
        expect(trie.check('test')).to.equal(false);
    });
    it('should handle words that are also prefixes', () => {
        trie.insert('ajout');
        trie.insert('ajouter');
        expect(trie.check('ajout')).to.equal(true);
    });
    it('should be able to validate sequences even if they are not a word', () => {
        trie.insert('test');
        expect(trie.check('test', true)).to.equal(true);
    });
    it('should return expected derivatives', () => {
        trie.insert('bonjour');
        trie.insert('bons');
        trie.insert('bonsoir');
        const structureTrie = new Trie('bon');
        structureTrie.insert('_o');
        structureTrie.insert('_ou_');
        structureTrie.insert('_oi_');
        const formableWords = trie.getFormableChildren('bon', structureTrie.rootNode);
        expect(formableWords).to.include('bonjour');
        expect(formableWords).to.include('bonsoir');
    });
    it('should not return uncomplete words', () => {
        trie.insert('bonjour');
        trie.insert('bonsoir');
        const structureTrie = new Trie('bon');
        structureTrie.insert('_o');
        structureTrie.insert('_ou_');
        structureTrie.insert('_oi_');
        const formableWords = trie.getFormableChildren('bon', structureTrie.rootNode);
        expect(formableWords).to.not.include('bons');
    });
});
