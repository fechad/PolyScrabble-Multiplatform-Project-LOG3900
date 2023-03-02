import { StructureNode } from '../linked-list-node';
import { TrieNode } from './trie-node';

export class Trie {
    private root: TrieNode;

    constructor(root: string = '') {
        this.root = new TrieNode(root);
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

    getFormableChildren(base: string, structure: StructureNode): string[] {
        const startNode = this.getLastNode(base);
        if (!startNode) return [];
        return this.searchChildren(base, structure, startNode);
    }
    private searchChildren(base: string, structure: StructureNode, startNode: TrieNode): string[] {
        const children: string[] = [];
        do {
            switch (structure.isAnyLetter) {
                case true:
                    if (!structure.next) {
                        startNode.children.forEach((child) => children.push(base + child.value));
                        break;
                    }
                    startNode.children.forEach((child) => {
                        const grandChildren = this.searchChildren(base + child.value, structure.next as StructureNode, child);
                        children.concat(grandChildren);
                    });
                    break;

                case false:
                    if (!structure.next) {
                        structure.values.forEach((value) => {
                            if (value in startNode.children) children.push(base + value);
                        });
                        break;
                    }
                    for (const char of structure.values) {
                        const index = startNode.children.findIndex((entry) => entry.value === char);
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        if (index === -1) continue;

                        const child = startNode.children[index];
                        children.concat(this.searchChildren(base + child.value, structure.next, child));
                    }

                    break;
                default:
                    break;
            }

            if (structure.next) structure = structure.next;
        } while (structure.next);
        return children;
    }
}
