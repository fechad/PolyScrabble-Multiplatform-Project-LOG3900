import { expect } from 'chai';
import { describe } from 'mocha';
import { WordCollection } from './word-collection';

const words = ['bonjour', 'bonsoir', 'maman', 'papa', 'bon'];
describe('WordCollection test', () => {
    const collection = new WordCollection(words);
    it('getNextWord should return the right word', () => {
        expect(collection.getNextWord(words[0])).to.equals(words[1]);
    });
    it('getNextWord should return undefined if the word was the last one', () => {
        expect(collection.getNextWord(words[4])).to.equals(undefined);
    });
    it('getNextWord should return undefined when the word provided is not part of collections', () => {
        expect(collection.getNextWord('notInCollection')).to.equals(undefined);
    });
    it('findDerivatives should return all valid derivatives of a word in a collection', () => {
        expect(collection.findDerivatives('bon')).to.deep.eq(['bonjour', 'bonsoir']);
    });
    it('should add a new word in words array', () => {
        collection.add('hello');
        words.push('hello');
        // => access to private attribut is necessary
        // eslint-disable-next-line dot-notation
        expect(collection['words']).to.deep.eq(words);
    });
});
