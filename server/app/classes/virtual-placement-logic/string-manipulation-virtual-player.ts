import { DICTIONARY_READER } from '@app/constants/reader-constant';

export class StringManipulator {
    static getPossibleLetters(word: string, availableLetters: string): string {
        const possibleLetters: Set<string> = new Set();
        for (const letter of [...availableLetters]) {
            if (DICTIONARY_READER.trie.check(word.toLowerCase().replace(/_/, letter))) possibleLetters.add(letter);
        }
        return Array.from(possibleLetters).join('');
    }

    static getAllStructures(possibleLetters: string[]): string[] {
        const possibilities: string[] = [];
        [...possibleLetters[0]].forEach((letter) => {
            possibilities.push(letter);
        });
        for (const options of possibleLetters.slice(1)) {
            const length = possibilities.length;
            for (let _ = 0; _ < length; _++) {
                const possibility = possibilities.pop();
                if (!possibility) break;
                [...options].forEach((option) => {
                    possibilities.splice(0, 0, possibility.concat(option));
                });
            }
        }
        return possibilities;
    }

    static getSplitIndexes(structure: string): number[] {
        const indexes: number[] = [];
        let previous = 1;
        while (previous > 0) {
            const index = structure.slice(previous).search(/_\p{L}/u);
            if (index <= 0) break;
            indexes.push(index + previous);
            previous += index + 1;
        }
        indexes.push(structure.length);
        return indexes.filter((index) => index > 0);
    }
}
