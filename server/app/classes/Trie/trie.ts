import { TrieNode } from './trie-node';

export class Trie {
    private root: TrieNode;

    constructor(root: string = '') {
        this.root = new TrieNode(root);
    }

    get rootNode() {
        return this.root;
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

    getFormableChildren(base: string, structure: TrieNode): string[] {
        const startNode = this.getLastNode(base);
        if (!startNode) return [];
        let children: string[] = [];
        structure.children.forEach((structureChild) => {
            startNode.children.forEach((nodeChild) => {
                const grandChildren = this.searchChildren(base, structureChild, nodeChild);
                children = children.concat(grandChildren);
            });
        });
        return children;
    }

    private searchChildren(base: string, structure: TrieNode, startNode: TrieNode): string[] {
        let children: string[] = [];

        if (!(structure.value === '_' || structure.value === startNode.value)) return children;

        const newWord = base + startNode.value;
        if (startNode.isEndOfWord) children.push(newWord);

        structure.children.forEach((structureChild) => {
            startNode.children.forEach((nodeChild) => {
                const grandChildren = this.searchChildren(newWord, structureChild, nodeChild);
                children = children.concat(grandChildren);
            });
        });
        return children;
    }
}
