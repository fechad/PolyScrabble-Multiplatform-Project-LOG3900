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
});
