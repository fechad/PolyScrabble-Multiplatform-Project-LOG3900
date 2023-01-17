import { expect } from 'chai';
import { describe } from 'mocha';
import { WordConstructor } from './word-constructor';

const TARGET = 'bonbons';
const BASE = 'ons';
const LETTERS_NEEDED = 'bonb'.split('');
const INSUFFICIENT_LETTERS = 'b'.split('');
describe('WordConstructor tests', () => {
    it('should return true when provided with the letters needed to form the base', () => {
        expect(WordConstructor.checkCanForm(TARGET, BASE, LETTERS_NEEDED)).to.equals(true);
    });
    it('should return false when not provided with the letters needed to form the base', () => {
        expect(WordConstructor.checkCanForm(TARGET, BASE, INSUFFICIENT_LETTERS)).to.equals(false);
    });
    it('should return false when not provided with the letters needed to form the base', () => {
        expect(WordConstructor.checkCanForm(TARGET, BASE, 'bazer'.split(''))).to.equals(false);
    });
});
