import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Rack } from '@app/classes/rack';
import { expect } from 'chai';
import * as sinon from 'sinon';
const ERROR = -1;
describe('Rack server', () => {
    let rack: Rack;
    let emptyRack: Rack;
    let bank: LetterBank;

    beforeEach(async () => {
        rack = new Rack('abfg');
        bank = new LetterBank();
        emptyRack = new Rack('');
    });
    // test insertLetters function rack
    it('should return false when the new letter', () => {
        const response = emptyRack.insertLetters('');
        expect(response).to.equal(false);
    });
    it('should return false if trying to put more than 7 letters in the rack', () => {
        const response = rack.insertLetters('hidfdf');
        expect(response).to.equal(false);
    });
    it('should return true if trying to put less than 7 letters in the rack', () => {
        const response = rack.insertLetters('cd');
        expect(response).to.equal(true);
    });
    // test fillRack method
    it('should return the error message as string when items is empty', () => {
        const items = '';
        const response = rack.fillRack(items, bank);
        expect(response).to.equal('Erreur une ou plusieurs lettres ne sont pas dans le chevalet');
    });
    it('should return the new rack letters if the replacement is accepted', () => {
        const items = 'b';
        rack.setLetters('bonjour');
        sinon.stub(bank, 'fetchRandomLetters').returns('a');
        const response = rack.fillRack(items, bank);
        expect(response).to.equal('aonjour');
    });
    // test removeLetter function rack
    it('should return false if index is superior or equal to rack length', () => {
        const index = 6;
        const response = rack.removeLetter(index);
        expect(response).to.equal(false);
    });
    it('should return false if index is inferior to 0', () => {
        const index = -1;
        const response = rack.removeLetter(index);
        expect(response).to.equal(false);
    });
    it('should to remove correctly the letter in position index', () => {
        const index = 2;
        const response = rack.removeLetter(index);
        const result = 'abg';
        expect(rack.getLetters()).to.eql(result);
        expect(response).to.equal(true);
    });
    // test removeLetters function rack
    it('should return false if indexes is empty', () => {
        const indexes: number[] = [];
        const response = rack.removeLetters(indexes);
        const result = 'abfg';
        expect(rack.getLetters()).to.eql(result);
        expect(response).to.equal(false);
    });
    it('should return false and restore letters array if one index is wrong', () => {
        const wrongIndex = -1;
        const indexes: number[] = [1, wrongIndex];
        const response = rack.removeLetters(indexes);
        const result = 'abfg';
        expect(rack.getLetters()).to.eql(result);
        expect(response).to.equal(false);
    });
    it('should to remove correctly the letters in position indexes', () => {
        const indexes: number[] = [1, 0];
        const response = rack.removeLetters(indexes);
        const result = 'fg';

        expect(rack.getLetters()).to.eql(result);
        expect(response).to.equal(true);
    });
    // edge tests findLetter function rack
    it('should return -1 if the letter to find is empty', () => {
        const prototype = Object.getPrototypeOf(rack);
        const response = prototype.findLetter('');
        expect(response).to.eql(ERROR);
    });
    it('should return -1 if the rack is empty when trying to find a letter', () => {
        const prototype = Object.getPrototypeOf(rack);
        prototype.setLetters('');
        const response = prototype.findLetter('a');
        expect(response).to.eql(ERROR);
    });
    // test findLetters function rack
    it('should empty array if trying to find empty string', () => {
        const response = rack.findLetters('');
        const result: number[] = [];
        expect(response).to.eql(result);
    });
    it('should empty array if one of the letters does not match with the rack letters list', () => {
        const response = rack.findLetters('abd');
        const result: number[] = [];
        expect(response).to.eql(result);
    });
    it('should return all the indexes we are looking for in the rack letters list', () => {
        const response = rack.findLetters('ab');
        const result = [0, 1];
        expect(response).to.eql(result);
    });
    // test transformSpecialChar(letter: string) using prototype because it is a private method
    it('should empty string if trying to transform empty string', () => {
        const prototype = Object.getPrototypeOf(rack);
        const response = prototype.transformSpecialChar('');
        const result = '';
        expect(response).to.eql(result);
    });
    it('should empty string if trying to transform multiple letters', () => {
        const prototype = Object.getPrototypeOf(rack);
        const response = prototype.transformSpecialChar('axds');
        const result = '';
        expect(response).to.eql(result);
    });
    it('should return "*" if getting an UpperCase', () => {
        const prototype = Object.getPrototypeOf(rack);
        const response = prototype.transformSpecialChar('É');
        const result = '*';
        expect(response).to.eql(result);
    });
    // test switchLetters
    const SPETIAL_LETTERS = 'ûùôéèêàâîç';
    const TRANSFORMED_LETTERS = 'uuoeeeaaic';
    it('should switch spetial letters correctly', () => {
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return '+';
        });
        let response = '';
        let result = '';
        for (let letter = 0; letter < SPETIAL_LETTERS.length; letter++) {
            rack.setLetters(TRANSFORMED_LETTERS[letter]);
            response = rack.switchLetters(SPETIAL_LETTERS[letter], bank);
            result = `1 Lettres ${SPETIAL_LETTERS[letter]} echangées avec +\nLe chevalet contient actuellement: +`;
            expect(response).to.eql(result);
        }
    });
    it('should return the right error when trying to switch non-existent letters in the Rack', () => {
        const result = 'Erreur une ou plusieurs lettres ne sont pas dans le chevalet';
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return 'tt';
        });
        const response = rack.switchLetters('kh', bank);
        expect(response).to.eql(result);
    });
    it('should return the right message when switching letters the first letters', () => {
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return 'kv';
        });
        const result = '2 Lettres ab echangées avec kv\nLe chevalet contient actuellement: kvfg';
        const response = rack.switchLetters('ab', bank);
        expect(response).to.eql(result);
    });
    it('should return the right message when switching the last letters', () => {
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return 'kv';
        });
        const result = '2 Lettres fg echangées avec kv\nLe chevalet contient actuellement: abkv';
        const response = rack.switchLetters('fg', bank);
        expect(response).to.eql(result);
    });
    it('should return the right message when switching duplicated letters', () => {
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return '***';
        });
        const result = '3 Lettres eee echangées avec ***\nLe chevalet contient actuellement: ***abfg';
        rack.setLetters('eeeabfg');
        const response = rack.switchLetters('eee', bank);
        expect(response).to.eql(result);
    });
    it('should return the right error if the letter bank returns an empty string when calling switchLetters', () => {
        sinon.stub(bank, 'fetchRandomLetters').callsFake(() => {
            return '';
        });
        const result = 'Erreur Lettres proposes par la reserve sont undefined ou vide';
        const response = rack.switchLetters('ab', bank);
        expect(response).to.eql(result);
    });
    // test isEmpty
    it('should return true if the rack is empty', () => {
        rack.setLetters('');
        expect(rack.isEmpty()).to.equal(true);
    });
    it('should return false if the rack is not empty', () => {
        rack.setLetters('a');
        expect(rack.isEmpty()).to.equal(false);
    });
    // test getSpaceLeft
    it('should return the number of empty boxes in the rack', () => {
        rack.setLetters('ab');
        const result = 5;
        expect(rack.getSpaceLeft()).to.eql(result);
    });
    // test getPointsOfRack
    it('should return the correct points in the rack', () => {
        rack.setLetters('aaaaaaa');
        const result = 7;
        expect(rack.getPointsOfRack(bank)).to.eql(result);
    });
    it('should return 0 when calling getPointsOfRack if getLetterScore the letters are undefined ', () => {
        rack.setLetters('aaaaaaa');
        sinon.stub(bank, 'getLetterScore').returns(undefined);
        const result = 0;
        expect(rack.getPointsOfRack(bank)).to.eql(result);
    });
});
