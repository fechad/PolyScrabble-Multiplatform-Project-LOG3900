import { TrieNode } from '@app/classes/Trie/trie-node';
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
    private iterate(base: string, structure: TrieNode, startNode: TrieNode, rackLetters: string[]): string[] {
        let children: string[] = [];
        let usedLetters;
        for (const structureChild of structure.children) {
            usedLetters = new Set<number>();
            for (const nodeChild of startNode.children) {
                const letterIndex = this.findAvailableLetter(nodeChild.value, usedLetters, rackLetters);
                const letterAlreadyPlaced = structureChild.value === nodeChild.value.toUpperCase() && structureChild.value !== '_';
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (letterIndex === -1 && !letterAlreadyPlaced) continue;
                const canPlaceLetter = rackLetters.includes(nodeChild.value) && !usedLetters.has(letterIndex);
                if (!canPlaceLetter && !letterAlreadyPlaced) continue;
                const grandChildren = this.searchChildren(base, structureChild, nodeChild, rackLetters);
                // Check that we only add used letters
                if (grandChildren.length > 0 && structureChild.value.toLowerCase() === structureChild.value) usedLetters.add(letterIndex);
                children = children.concat(grandChildren);
            }
        }
        return children;
    }
    private searchChildren(base: string, structure: TrieNode, startNode: TrieNode, rackLetters: string[]): string[] {
        const children: string[] = [];
        if (!(structure.value === '_' || structure.value.toLowerCase() === startNode.value)) return children;
        const newWord = base + startNode.value;
        if (startNode.isEndOfWord && structure.isEndOfWord) children.push(newWord);
        const grandChildren = this.iterate(newWord, structure, startNode, rackLetters);
        return grandChildren.concat(children);
    }
}
