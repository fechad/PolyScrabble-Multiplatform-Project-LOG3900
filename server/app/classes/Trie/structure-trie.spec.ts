import { expect } from 'chai';
import { describe } from 'mocha';
import { WordStructureTrie } from './structure-trie';

describe.only('WordStructureTrie', () => {
    let trie: WordStructureTrie;
    beforeEach(() => {
        trie = new WordStructureTrie('bon');
    });
    it('should recognize correctly the end of a word with an unending sequence of _ at the end', () => {
        trie.insert('s___');
        expect(trie.check('s', false)).to.equal(true);
        expect(trie.check('s_', false)).to.equal(true);
        expect(trie.check('s__', false)).to.equal(true);
        expect(trie.check('s___', false)).to.equal(true);
    });
    it('should recognize correctly the end of a word with a sequence of _ in the middle', () => {
        trie.insert('s___ir_');
        expect(trie.check('s', false)).to.equal(false);
        expect(trie.check('s___i', false)).to.equal(false);
        expect(trie.check('s___ir', false)).to.equal(true);
        expect(trie.check('s___ir_', false)).to.equal(true);
    });
    it('should add a word composed only of _', () => {
        trie.insert('___');
        expect(trie.check('_', false)).to.equal(true);
        expect(trie.check('__', false)).to.equal(true);
        expect(trie.check('___', false)).to.equal(true);
    });
});
