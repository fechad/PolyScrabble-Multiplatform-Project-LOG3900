export class WordCollection {
    private words: string[];
    constructor(words?: string[]) {
        if (words) this.words = words;
    }
    getNextWord(word: string): string | undefined {
        const index = this.words.indexOf(word) + 1;
        if (index <= 0) return;
        if (index >= this.words.length) return undefined;
        return this.words[index];
    }
    add(word: string) {
        // Disabled because -1 is the default return value when word is not in array
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.words.indexOf(word) === -1) this.words.push(word);
    }
    findDerivatives(base: string): string[] {
        const derivatives: string[] = [];
        this.words.forEach((word) => {
            if (word === base) return;
            if (word.includes(base)) derivatives.push(word);
        });
        return derivatives;
    }
}
