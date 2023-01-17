import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { MultiplierType } from '@app/classes/classes-constants';
import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { JsonReader } from '@app/services/json-reader.service';
import { JsonObject } from 'swagger-ui-express';

const DEFAULT_MULTIPLIER_VALUE = 1;
const DEFAULT_MULTIPLIER_TYPE = MultiplierType.LetterMultiplier;
export class SpecialCasesReader {
    private translator: IndexationTranslator;
    private specialCases: Map<number, SpecialCaseInfo>;
    constructor() {
        this.translator = new IndexationTranslator();
        this.specialCases = new Map<number, SpecialCaseInfo>();
        const jsonReader = new JsonReader();
        this.extractSpecialCases(jsonReader.getData('specialCases.json'));
    }
    checkCaseIsSpecial(index: number) {
        return this.specialCases.has(index);
    }
    getSpecialCaseInfo(index: number): SpecialCaseInfo {
        if (this.checkCaseIsSpecial(index)) return this.specialCases.get(index) as SpecialCaseInfo;
        return { multiplierValue: DEFAULT_MULTIPLIER_VALUE, multiplierType: DEFAULT_MULTIPLIER_TYPE };
    }
    private extractMultipliers(multipliers: JsonObject[], type: MultiplierType) {
        for (const multiplier of multipliers) {
            const multiplierInfo: SpecialCaseInfo = { multiplierValue: multiplier.value, multiplierType: type };
            const tableIndex = this.translator.findTableIndex(multiplier.row.toLowerCase(), multiplier.column);
            if (tableIndex !== undefined) this.specialCases.set(tableIndex, multiplierInfo);
        }
    }
    private extractSpecialCases(jsonData: JsonObject) {
        let multipliersToExtract = jsonData.wordValueMultipliers;
        this.extractMultipliers(multipliersToExtract, MultiplierType.WordMultiplier);
        multipliersToExtract = jsonData.letterValueMultipliers;
        this.extractMultipliers(multipliersToExtract, MultiplierType.LetterMultiplier);
    }
}
