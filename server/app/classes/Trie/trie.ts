import { TrieNode } from './trie-node';

export class Trie {
    protected root: TrieNode;

    constructor(root: string = '') {
        this.root = new TrieNode(root);
    }

    get rootNode() {
        return this.root;
    }
    insert(word: string) {
        let current = this.root;
        for (const char of word) {
            current = this.findOrCreateNode(current, char);
        }
        current.isEndOfWord = true;
    }
    getLastNode(word: string): null | TrieNode {
        let current = this.root;
        for (const char of word) {
            const index = current.children.findIndex((node) => node.value === char);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (index === -1) return null;

            current = current.children[index];
        }
        return current;
    }

    check(word: string, onlyCheckSequence: boolean = false): boolean {
        const finalNode = this.getLastNode(word);
        if (!finalNode) return false;
        if (onlyCheckSequence) return true;
        return finalNode.isEndOfWord;
    }

    protected findOrCreateNode(startNode: TrieNode, char: string): TrieNode {
        let index = startNode.children.findIndex((node) => node.value === char);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (index === -1) {
            const newNode = new TrieNode(char);
            startNode.children.push(newNode);
            index = startNode.children.length - 1;
        }
        return startNode.children[index];
    }
}
