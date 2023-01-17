import { BANK_ALPHABET_SORTED } from '@app/constants/constants';
import { LetterInformation } from '@app/interfaces/letter-info';
import { LetterOccurrence } from '@app/interfaces/letter-occurence';
import { JsonReader } from '@app/services/json-reader.service';
import { JsonObject } from 'swagger-ui-express';

export class LetterBank {
    private letters: Map<string, LetterInformation>;
    private lettersCount;
    constructor() {
        this.lettersCount = 0;
        this.letters = new Map<string, LetterInformation>();
        this.buildBank(new JsonReader().getData('letterBank.json'));
    }
    insertLetters(items: string) {
        for (const letter of items) {
            const letterInfo = this.letters.get(letter) as LetterInformation;
            letterInfo.quantity++;
            this.lettersCount++;
        }
    }
    produceValueMap(): Map<string, number> {
        const values = new Map<string, number>();
        for (const letter of this.letters) {
            values.set(letter[0], letter[1].score);
        }
        return values;
    }
    getLetterQuantity(letter: string): number | undefined {
        return this.letters.get(letter.toLowerCase())?.quantity;
    }
    getUniqueLettersCount(): number {
        return this.letters.size;
    }
    getLettersCount(): number {
        return this.lettersCount;
    }
    getLetterScore(letter: string): number | undefined {
        return this.letters.get(letter.toLowerCase())?.score;
    }
    getLetterInfos(letter: string): LetterInformation | undefined {
        return this.letters.get(letter.toLowerCase());
    }
    convertAvailableLettersBankToString(): string {
        let letters = '';
        for (const [letter, letterInfo] of this.letters) {
            const quantity = letterInfo.quantity;
            if (quantity > 0) {
                letters += letter;
            }
        }
        return letters;
    }
    fetchRandomLetters(quantity: number): string {
        let randomLetters = '';
        while (randomLetters.length < quantity && this.lettersCount > 0) {
            const randomLetter = this.generateRandomLetter();
            const letterInfos = this.letters.get(randomLetter);
            if (!letterInfos) {
                continue;
            }
            if (letterInfos.quantity > 0) {
                randomLetters += randomLetter;
                this.removeLetter(letterInfos);
            }
        }
        // fill with spaces if the bank can't afford the requested quantity of letters
        while (randomLetters.length < quantity) {
            randomLetters += ' ';
        }
        return randomLetters;
    }
    stringifyContent(): string {
        const bankContent: string[] = [];
        for (const occurence of this.getLetterOccurrencesAlphabetically()) {
            bankContent.push(`${occurence.letter} : ${occurence.quantity}`);
        }
        return bankContent.join('\n');
    }

    private getLetterOccurrencesAlphabetically(): LetterOccurrence[] {
        const content: LetterOccurrence[] = [];
        for (const alphabetLetter of BANK_ALPHABET_SORTED) {
            const bankLetter = this.getLetterInfos(alphabetLetter);
            if (bankLetter) {
                content.push({ letter: alphabetLetter, quantity: bankLetter.quantity });
            }
        }
        return content;
    }
    private removeLetter(letter: LetterInformation) {
        letter.quantity--;
        this.lettersCount--;
    }
    private generateRandomLetter(): string {
        const characters = this.convertLettersToString();
        const pos = Math.floor(Math.random() * characters.length);
        return characters.charAt(pos);
    }
    private convertLettersToString(): string {
        let letters = '';
        for (const [letter, letterInfo] of this.letters) {
            const quantity = letterInfo.quantity;
            if (quantity > 0) {
                letters += letter.repeat(quantity);
            }
        }
        return letters;
    }

    private buildBank(bankData: JsonObject) {
        const letters = bankData.reserve;
        let bankSize = 0;
        for (const letterData of letters) {
            bankSize += letterData.quantity;
            const letterInformation: LetterInformation = { score: letterData.score, quantity: letterData.quantity };
            this.letters.set(letterData.letter.toLowerCase(), letterInformation);
        }
        this.lettersCount = bankSize;
    }
}
