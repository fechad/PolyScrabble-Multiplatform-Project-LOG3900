import { expect } from 'chai';
import { describe } from 'mocha';
import { SpecialCasesReader } from './special-cases-reader';

const WORD_MULTIPLIER_TABLE_INDEX = 1;
const INVALID_INDEX = 0;
describe('SpecialCasesReader tests', () => {
    const reader = new SpecialCasesReader();
    it('should true when asked if a contained special case is special', () => {
        expect(reader.checkCaseIsSpecial(WORD_MULTIPLIER_TABLE_INDEX)).to.equals(true);
    });
    it('should false when asked if a contained special case is special', () => {
        expect(reader.checkCaseIsSpecial(INVALID_INDEX)).to.equals(false);
    });
});
