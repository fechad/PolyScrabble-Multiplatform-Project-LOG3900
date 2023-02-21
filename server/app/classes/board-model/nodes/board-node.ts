import { Directions } from '@app/enums/directions';
import { MultiplierType } from '@app/enums/multiplier-type';
import { SpecialCaseInfo } from '@app/interfaces/special-case-info';
import { JsonReader } from '@app/services/json-reader.service';

export class BoardNode {
    content: string | null;
    value: number;
    index: number;
    isNewValue: boolean;
    multiplier: SpecialCaseInfo;
    private neighbors: Map<Directions, BoardNode>;
    private letterValues: Map<string, number>;

    constructor(index: number, multiplierInfo?: SpecialCaseInfo) {
        this.neighbors = new Map<Directions, BoardNode>();
        this.letterValues = new Map<string, number>();
        this.content = null;
        this.value = 0;
        this.index = index;
        this.isNewValue = false;
        this.multiplier = multiplierInfo === undefined ? { multiplierValue: 1, multiplierType: MultiplierType.LetterMultiplier } : multiplierInfo;
        this.setLetterValues();
    }
    getNeighbor(direction: Directions): BoardNode | undefined {
        return this.neighbors.get(direction);
    }
    registerNeighbor(node: BoardNode, direction: Directions) {
        this.neighbors.set(direction, node);
    }
    setLetter(letter: string) {
        if (!this.letterValues.has(letter.toLowerCase()) || letter === '*') return;
        this.content = letter.toLowerCase();
        this.isNewValue = true;
        this.value = this.content === letter ? (this.letterValues.get(this.content) as number) : 0;
    }
    confirmPlacement() {
        this.isNewValue = false;
        this.multiplier.multiplierValue = 1;
    }
    undoPlacement() {
        this.isNewValue = false;
        this.content = null;
        this.value = 0;
    }
    getScore(): number {
        if (this.isNewValue)
            return this.value * (this.multiplier.multiplierType === MultiplierType.LetterMultiplier ? this.multiplier.multiplierValue : 1);
        return this.value;
    }
    getWordMultiplier(): number {
        if (!this.isNewValue) return 1;
        return this.multiplier.multiplierType === MultiplierType.WordMultiplier ? this.multiplier.multiplierValue : 1;
    }
    private setLetterValues() {
        const letters = new JsonReader().getData('letterBank.json').reserve;
        for (const letter of letters) this.letterValues.set(letter.letter.toLowerCase(), letter.score);
    }
}
