import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { Trie } from '@app/classes/Trie/trie';
import { TrieNode } from '@app/classes/Trie/trie-node';

export class WordsFinder {
    private dictionaryTrie: Trie;
    constructor(trie?: Trie) {
        if (trie) this.dictionaryTrie = trie;
        else this.dictionaryTrie = new DictionaryReader().getWordsTrie();
    }

    findFormableChildren(base: string, structure: TrieNode, rackLetters: string[]): string[] {
        const startNode = this.dictionaryTrie.getLastNode(base);
        if (!startNode) return [];
        return this.iterate(base, structure, startNode, rackLetters);
    }

    private iterate(
        base: string,
        structure: TrieNode,
        startNode: TrieNode,
        rackLetters: string[],
        usedLetters: Set<number> = new Set<number>(),
    ): string[] {
        let children: string[] = [];
        for (const structureChild of structure.children) {
            for (const nodeChild of startNode.children) {
                const letterIndex = rackLetters.findIndex((letter) => nodeChild.value === letter);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (letterIndex === -1) break;
                if (rackLetters.includes(nodeChild.value) && !usedLetters.has(letterIndex)) {
                    const grandChildren = this.searchChildren(base, structureChild, nodeChild, rackLetters, new Set([...usedLetters, letterIndex]));
                    usedLetters.add(letterIndex);
                    children = children.concat(grandChildren);
                }
            }
        }
        return children;
    }
    private searchChildren(base: string, structure: TrieNode, startNode: TrieNode, rackLetters: string[], usedLetters: Set<number>): string[] {
        const children: string[] = [];

        if (!(structure.value === '_' || structure.value === startNode.value)) return children;

        const newWord = base + startNode.value;
        if (startNode.isEndOfWord && structure.isEndOfWord) children.push(newWord);
        const grandChildren = this.iterate(newWord, structure, startNode, rackLetters, usedLetters);
        return grandChildren.concat(children);
    }
}
