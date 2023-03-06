import { Trie } from '@app/classes/Trie/trie';
import { TrieNode } from '@app/classes/Trie/trie-node';
import { DICTIONARY_READER } from '@app/constants/reader-constant';

export class WordsFinder {
    private dictionaryTrie: Trie;
    constructor(trie?: Trie) {
        if (trie) this.dictionaryTrie = trie;
        else this.dictionaryTrie = DICTIONARY_READER.getWordsTrie();
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
                const letterAlreadyPlaced = structureChild.value.toLowerCase() === nodeChild.value;
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (letterIndex === -1 && !letterAlreadyPlaced) continue;
                const canPlaceLetter = rackLetters.includes(nodeChild.value) && !usedLetters.has(letterIndex);
                if (canPlaceLetter || letterAlreadyPlaced) {
                    const grandChildren = this.searchChildren(base, structureChild, nodeChild, rackLetters, new Set([...usedLetters, letterIndex]));
                    // Check that we only add used letters
                    if (grandChildren.length > 0 && structureChild.value.toLowerCase() === structureChild.value) usedLetters.add(letterIndex);
                    children = children.concat(grandChildren);
                }
            }
        }
        return children;
    }
    private searchChildren(base: string, structure: TrieNode, startNode: TrieNode, rackLetters: string[], usedLetters: Set<number>): string[] {
        const children: string[] = [];
        if (!(structure.value === '_' || structure.value.toLowerCase() === startNode.value)) return children;
        const newWord = base + startNode.value;
        if (startNode.isEndOfWord && structure.isEndOfWord) children.push(newWord);
        const grandChildren = this.iterate(newWord, structure, startNode, rackLetters, usedLetters);
        return grandChildren.concat(children);
    }
}
