import { expect } from 'chai';
import { StringManipulator } from './string-manipulation-virtual-player';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('String Manipulator tests', () => {
    it('should get all the possible letters', () => {
        let baseWord = 'te_t';
        let availableLetters = 'qszx';
        let expected = 's';
        expect(StringManipulator.getPossibleLetters(baseWord, availableLetters)).to.be.equals(expected);

        baseWord = 'bon_our';
        availableLetters = 'qszxj';
        expected = 'j';
        expect(StringManipulator.getPossibleLetters(baseWord, availableLetters)).to.be.equals(expected);

        baseWord = 'ri_';
        availableLetters = 'qszxj';
        expected = 'sz';
        expect(StringManipulator.getPossibleLetters(baseWord, availableLetters)).to.be.equals(expected);

        baseWord = '_ivre';
        availableLetters = 'qlzxv';
        expected = 'lv';
        expect(StringManipulator.getPossibleLetters(baseWord, availableLetters)).to.be.equals(expected);
    });
    it('should get all the structures', () => {
        let restOfString = ['_', '_', '_', '_'];
        let expected = ['____'];
        expect(StringManipulator.getAllStructures(restOfString)).to.deep.equals(expected);

        restOfString = ['a', 'b', 'c', 'd'];
        expected = ['abcd'];
        expect(StringManipulator.getAllStructures(restOfString)).to.deep.equals(expected);

        restOfString = ['a', 'b', 'c', 'de'];
        expected = ['abce', 'abcd'];
        expect(StringManipulator.getAllStructures(restOfString)).to.deep.equals(expected);

        restOfString = ['a', 'bs', 'c', 'de'];
        expected = ['asce', 'ascd', 'abce', 'abcd'];
        expect(StringManipulator.getAllStructures(restOfString)).to.deep.equals(expected);
    });

    it('should get all the indexes to split', () => {
        let word = '_onjour';
        let expected: number[] = [7];
        expect(StringManipulator.getSplitIndexes(word)).to.deep.equals(expected);

        word = '____b';
        expected = [3, 5];
        expect(StringManipulator.getSplitIndexes(word)).to.deep.equals(expected);

        word = '____b____b';
        expected = [3, 8, 10];
        expect(StringManipulator.getSplitIndexes(word)).to.deep.equals(expected);

        word = '_b_b_____b';
        expected = [2, 8, 10];
        expect(StringManipulator.getSplitIndexes(word)).to.deep.equals(expected);

        word = '_b_b_b___b';
        expected = [2, 4, 8, 10];
        expect(StringManipulator.getSplitIndexes(word)).to.deep.equals(expected);
    });
});
