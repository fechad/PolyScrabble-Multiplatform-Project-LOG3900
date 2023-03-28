import { TrieNode } from '@app/classes/Trie/trie-node';
import { INVALID } from '@app/constants/constants';
import { DICTIONARY_READER } from '@app/constants/reader-constant';

export class WordsFinder {
    findFormableChildren(base: string, structure: TrieNode, rackLetters: string[]): string[] {
        const startNode = DICTIONARY_READER.trie.getLastNode(base);
        if (!startNode) return [];
        return this.iterate(base, structure, startNode, rackLetters);
    }
    private findAvailableLetter(nodeValue: string, usedLetters: Set<number>, rackLetters: string[]) {
        return rackLetters.findIndex((letter, index) => nodeValue === letter && !usedLetters.has(index));
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
                const letterIndex = this.findAvailableLetter(nodeChild.value, usedLetters, rackLetters);
                const letterAlreadyPlaced = structureChild.value === nodeChild.value.toUpperCase() && structureChild.value !== '_';

                if (letterIndex === INVALID && !letterAlreadyPlaced) continue;
                const canPlaceLetter = rackLetters.includes(nodeChild.value) && !usedLetters.has(letterIndex);
                if (!canPlaceLetter && !letterAlreadyPlaced) continue;

                const updatedUsedLetters = letterIndex === INVALID ? new Set([...usedLetters]) : new Set([...usedLetters, letterIndex]);
                const grandChildren = this.searchChildren(base, structureChild, nodeChild, rackLetters, updatedUsedLetters);

                children = children.concat(grandChildren);
            }
        }
        return children;
    }
    private searchChildren(base: string, structure: TrieNode, startNode: TrieNode, rackLetters: string[], usedLetters: Set<number>): string[] {
        const children: string[] = [];
        const skipCondition = structure.value !== '_' && structure.value.toLowerCase() !== startNode.value;
        if (skipCondition) return children;
        const newWord = base + startNode.value;
        if (startNode.isEndOfWord && structure.isEndOfWord) children.push(newWord);
        const grandChildren = this.iterate(newWord, structure, startNode, rackLetters, usedLetters);
        return grandChildren.concat(children);
    }
}
