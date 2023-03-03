import { Trie } from './trie';

export class WordStructureTrie extends Trie {
    constructor(root: string = '') {
        super(root);
    }

    // An example of why we need this: say the root is "bon" and we pass the structure "s_____".
    // Technically the end of the word can be s or any _ after it
    override insert(word: string): void {
        let current = this.root;
        const sequences = this.splitOnUnendingSequence(word);
        if (sequences[1] === '') return super.insert(sequences[0]);

        for (const char of sequences[0]) {
            current = super.findOrCreateNode(current, char);
        }
        current.isEndOfWord = true;

        for (const char of sequences[1]) {
            current = super.findOrCreateNode(current, char);
            current.isEndOfWord = true;
        }
    }

    private splitOnUnendingSequence(word: string): [string, string] {
        // We reverse the string so it is easier for us to isolate the final sequence of _ if any
        const reversed = word.split('').reverse().join('');
        const match = reversed.match(/^(_*)(.*)$/);
        if (!match) return [word, ''];
        const [leadingUnderscores, restOfString] = match.slice(1);

        const mandatory = restOfString.split('').reverse().join('');

        return [mandatory, leadingUnderscores];
    }
}
