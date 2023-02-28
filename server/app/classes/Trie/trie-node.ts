export class TrieNode {
    value: string;
    children: TrieNode[];
    isEndOfWord: boolean;

    constructor(value: string) {
        this.value = value;
        this.children = [];
        this.isEndOfWord = false;
    }
}
