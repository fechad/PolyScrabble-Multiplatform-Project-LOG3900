import { TrieNode } from './trie-node';

export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode('');
    }

    insert(word: string) {
        let current = this.root;
        for (const char of word) {
            let index = current.children.findIndex((node) => node.value === char);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (index === -1) {
                const newNode = new TrieNode(char);
                current.children.push(newNode);
                index = current.children.length - 1;
            }
            current = current.children[index];
        }
        current.isEndOfWord = true;
    }

    search(word: string): boolean {
        let current = this.root;
        for (const char of word) {
            const index = current.children.findIndex((node) => node.value === char);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (index === -1) return false;

            current = current.children[index];
        }
        return current.isEndOfWord;
    }
}
