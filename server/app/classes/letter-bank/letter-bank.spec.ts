/* eslint-disable dot-notation */ // we want to access private attribute
import { INITIAL_BANK_SIZE, RACK_CAPACITY } from '@app/constants/constants';
import { LetterInformation } from '@app/interfaces/letter-info';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { LetterBank } from './letter-bank';

const DEFAULT_TEST_LETTER = 'c';
const DEFAULT_UNDEFINED_CONTENT = 'Ilov3Testing';
const DEFAULT_QUANTITY = 2;
const DEFAULT_SCORE = 3;
const DEFAULT_LETTER_QUANTITY = 27;
describe('LetterBank tests', () => {
    const mockedLetterInformation: LetterInformation = { quantity: 1, score: 1 };
    let bank: LetterBank;
    beforeEach(() => {
        bank = new LetterBank();
    });
    it('produceValueMap should contain the correct number of entries', () => {
        const values = bank.produceValueMap();
        expect(values.size).to.equals(bank.getUniqueLettersCount());
    });
    it('getLetterScore should return the correct score for a letter from letterBank.json', () => {
        expect(bank.getLetterScore(DEFAULT_TEST_LETTER)).to.be.equals(DEFAULT_SCORE);
    });
    it('getLetterQuantity should return the correct quantity for a letter from letterBank.json', () => {
        expect(bank.getLetterQuantity(DEFAULT_TEST_LETTER)).to.be.equals(DEFAULT_QUANTITY);
    });
    it('getLEtterScore should return undefined for a letter not from letterBank.json', () => {
        expect(bank.getLetterScore(DEFAULT_UNDEFINED_CONTENT)).to.be.equals(undefined);
    });
    it('getLetterQuantity should return undefined for a letter not from letterBank.json', () => {
        expect(bank.getLetterQuantity(DEFAULT_UNDEFINED_CONTENT)).to.be.equals(undefined);
    });
    it('getLetterScore should not be case sensitive', () => {
        const upperCaseResult = bank.getLetterScore(DEFAULT_TEST_LETTER.toUpperCase());
        const lowerCaseResult = bank.getLetterScore(DEFAULT_TEST_LETTER.toLowerCase());
        expect(upperCaseResult).to.eql(lowerCaseResult);
    });
    it('getLetterQuantity should not be case sensitive', () => {
        const upperCaseResult = bank.getLetterQuantity(DEFAULT_TEST_LETTER.toUpperCase());
        const lowerCaseResult = bank.getLetterQuantity(DEFAULT_TEST_LETTER.toLowerCase());
        expect(upperCaseResult).to.eql(lowerCaseResult);
    });

    it('calling size should return 102 letters', () => {
        expect(bank.getLettersCount()).to.eql(INITIAL_BANK_SIZE);
    });

    it('calling removeRandomLetters should remove as many letters as asked', () => {
        const initialSize = bank.getLettersCount();
        const nLettersToRemove = 5;
        const letters = bank.fetchRandomLetters(nLettersToRemove);
        expect(letters.length).to.eql(nLettersToRemove);
        expect(bank.getLettersCount()).to.eql(initialSize - nLettersToRemove);
    });

    it('should ignore undefined letters', () => {
        const rackCapacityA = 'aaaaaaa';
        const getLetterStub = sinon.stub(bank['letters'], 'get');
        getLetterStub.onCall(0).returns(undefined);
        getLetterStub.returns({ quantity: 1, score: 1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  -- we want to stub private method
        sinon.stub(bank as any, 'generateRandomLetter').returns('a');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  -- we want to stub private method
        sinon.stub(bank as any, 'removeLetter');
        expect(bank.fetchRandomLetters(RACK_CAPACITY)).to.equal(rackCapacityA);
    });

    it('should fill with space if there are not enough letters', () => {
        const rackCapacitySpace = '       ';
        bank['lettersCount'] = 0;
        expect(bank.fetchRandomLetters(RACK_CAPACITY)).to.equal(rackCapacitySpace);
    });

    describe('stringifyContent() tests', () => {
        it('should create a string with the content of the letter bank with that format LETTER : QUANTITY', () => {
            const content = bank.stringifyContent();
            const schema = `${DEFAULT_TEST_LETTER} : ${bank.getLetterQuantity(DEFAULT_TEST_LETTER)}`;
            expect(content).to.contain(schema);
        });
        it('should not discard the letters that have a quantity of 0', () => {
            const bankPrototype = Object.getPrototypeOf(bank);
            const letters = new Map<string, LetterInformation>();
            letters.set('b', { quantity: 0, score: 1 });
            bankPrototype.letters = letters;
            const content = bankPrototype.stringifyContent();
            expect(content).to.equal('b : 0');
        });
        it('should display wildcard letter (*) at the end', () => {
            const bankPrototype = Object.getPrototypeOf(bank);
            const letters = new Map<string, LetterInformation>();
            letters.set('a', { quantity: 3, score: 1 });
            letters.set('*', { quantity: 2, score: 1 });
            letters.set('b', { quantity: 1, score: 1 });
            bankPrototype.letters = letters;
            const content = bankPrototype.stringifyContent();
            expect(content).to.equal('a : 3\nb : 1\n* : 2');
        });
        it('should display the letter bank on 27 lines (from the document of vision)', () => {
            const content = bank.stringifyContent();
            expect(content.split('\n').length).to.equal(DEFAULT_LETTER_QUANTITY);
        });
    });
    describe('getLetterOccurencesAlphabetically() tests', () => {
        it('calling should return the letters alphabetically', () => {
            const bankPrototype = Object.getPrototypeOf(bank);
            const unsortedLetters = new Map<string, LetterInformation>();
            unsortedLetters.set('b', mockedLetterInformation);
            unsortedLetters.set('a', mockedLetterInformation);
            bankPrototype.letters = unsortedLetters;
            const result = bankPrototype.getLetterOccurrencesAlphabetically();
            expect(result.length).to.equal(2);
            expect(result[0].letter).to.equal('a');
            expect(result[1].letter).to.equal('b');
        });
        it('should return an empty array when the bank is empty', () => {
            const bankPrototype = Object.getPrototypeOf(bank);
            bankPrototype.letters = new Map<string, LetterInformation>();
            expect(bankPrototype.getLetterOccurrencesAlphabetically().length).to.equal(0);
        });
    });

    it('should contain the wildcard letter as "*"', () => {
        expect(bank.getLetterInfos('*')).not.to.equal(undefined);
    });
});
