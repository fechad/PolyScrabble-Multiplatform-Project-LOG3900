import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { RACK_CAPACITY } from '@app/constants/constants';
const ERROR = -1;
const SPECIAL_U = 'ûù';
const SPECIAL_O = 'ô';
const SPECIAL_E = 'éèê';
const SPECIAL_A = 'àâ';
const SPECIAL_I = 'î';
const SPECIAL_C = 'ç';

export class Rack {
    indexLetterToReplace: number[];
    private letters: string;

    constructor(newLetters: string) {
        this.letters = '';
        this.insertLetters(newLetters);
    }
    getLetters(): string {
        return this.letters;
    }
    setLetters(word: string) {
        this.letters = word;
    }
    removeLetter(index: number): boolean {
        if (index >= this.letters.length || index < 0) {
            return false;
        }
        const lettersTmp = this.letters.substring(0, index) + this.letters.slice(index + 1, this.letters.length);
        this.letters = lettersTmp;
        return true;
    }
    removeLetters(indexes: number[]): boolean {
        if (indexes.length === 0 || indexes === undefined) {
            return false;
        }
        const backup = this.letters;
        for (const index of indexes) {
            if (!this.removeLetter(index)) {
                this.letters = backup;
                return false;
            }
        }
        return true;
    }
    insertLetters(newLetters: string): boolean {
        if (newLetters === undefined || newLetters.length === 0) {
            return false;
        }
        if (newLetters.length > this.getSpaceLeft()) {
            return false;
        }
        for (const letter of newLetters) {
            this.letters = this.letters + this.transformSpecialChar(letter);
        }
        return true;
    }

    findLetters(lettersToFind: string): number[] {
        if (lettersToFind === '' || lettersToFind === undefined) {
            return [];
        }
        const indexLettersFound = new Array();
        let indexLetter = -1;
        const lettersCopy = this.letters;
        for (const letter of lettersToFind) {
            indexLetter = this.findLetter(letter);
            if (indexLetter === ERROR) {
                return [];
            }
            indexLettersFound.push(indexLetter);
            // erase letter by replacing it by a space so that we can handle easily duplicated letters
            this.letters = this.replaceCharAt(this.letters, indexLetter, ' ');
        }
        this.letters = lettersCopy;
        return indexLettersFound;
    }

    getSpaceLeft(): number {
        return RACK_CAPACITY - this.letters.length;
    }

    isEmpty(): boolean {
        return this.getSpaceLeft() === RACK_CAPACITY;
    }

    switchLetters(items: string, bank: LetterBank): string {
        let lettersToInsert: string;
        try {
            lettersToInsert = this.validateReplacement(items, bank);
        } catch (error) {
            return error.message;
        }
        return `${items.length} Lettres ${items} echangées avec ${lettersToInsert}\nLe chevalet contient actuellement: ${this.letters}`;
    }

    fillRack(items: string, bank: LetterBank): string {
        try {
            this.validateReplacement(items, bank);
        } catch (error) {
            return error.message;
        }
        return this.letters;
    }

    getPointsOfRack(bank: LetterBank): number {
        let pointsOfRack = 0;
        for (const letter of this.letters) {
            const letterScore = bank.getLetterScore(letter);
            if (!letterScore) {
                continue;
            }
            pointsOfRack += letterScore;
        }
        return pointsOfRack;
    }

    private findLetter(letter: string): number {
        if (letter === undefined || letter.length !== 1) {
            return ERROR;
        }
        if (this.letters === undefined || this.letters === '') {
            return ERROR;
        }
        const transformedLetter = this.transformSpecialChar(letter);
        for (let i = 0; i < this.letters.length; i++) {
            if (this.letters[i] === transformedLetter) {
                return i;
            }
        }
        return ERROR;
    }
    private validateReplacement(items: string, bank: LetterBank): string {
        const indexes = this.findLetters(items as string);
        if (indexes.length === 0) {
            throw new Error('Erreur une ou plusieurs lettres ne sont pas dans le chevalet');
        }
        const lettersToInsert = bank.fetchRandomLetters(indexes.length);
        if (!this.replaceLetters(lettersToInsert, indexes)) {
            throw new Error('Erreur Lettres proposes par la reserve sont undefined ou vide');
        }
        return lettersToInsert;
    }

    private replaceLetters(lettersToInsert: string, oldLetters: number[]): boolean {
        if (lettersToInsert.length === 0 || lettersToInsert === undefined) {
            return false;
        }
        for (let letter = 0; letter < lettersToInsert.length; letter++) {
            this.letters = this.replaceCharAt(this.letters, oldLetters[letter], lettersToInsert[letter]);
        }
        return true;
    }
    private replaceCharAt(str: string, index: number, newChar: string): string {
        return str.substring(0, index) + newChar + str.substring(index + 1);
    }
    private transformSpecialChar(letter: string): string {
        if (letter.length !== 1 || letter === undefined) {
            return '';
        }
        // if letter is a special letter
        const letterToTest = letter.toLowerCase();
        if (letter !== letterToTest) {
            // it means that letter is upperCase => blank char
            return '*';
        }
        if (SPECIAL_U.includes(letterToTest)) {
            return 'u';
        }
        if (SPECIAL_O.includes(letterToTest)) {
            return 'o';
        }
        if (SPECIAL_A.includes(letterToTest)) {
            return 'a';
        }
        if (SPECIAL_I.includes(letterToTest)) {
            return 'i';
        }
        if (SPECIAL_E.includes(letterToTest)) {
            return 'e';
        }
        if (SPECIAL_C.includes(letterToTest)) {
            return 'c';
        }
        return letterToTest;
    }
}
