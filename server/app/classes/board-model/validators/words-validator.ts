import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { NodeStream } from '@app/classes/board-model/nodes/node-stream';
import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { DEFAULT_DICTIONARY_PATH } from '@app/constants/constants';
import { PlacementDirections } from '@app/enums/placement-directions';

const MIN_WORD_LENGTH = 2;
export class WordsValidator {
    private longestWordLength;
    private dictionaryReader;
    constructor(dictionaryName: string = DEFAULT_DICTIONARY_PATH) {
        this.dictionaryReader = new DictionaryReader(dictionaryName);
        this.longestWordLength = 0;
    }
    validateWordsFormed(startNode: BoardNode, placementDirection: PlacementDirections): boolean {
        const initialStream = new NodeStream(startNode);
        initialStream.elaborateNodesFlow(placementDirection);

        if (!this.validateStream(placementDirection, initialStream)) return false;
        const reverseDirection = DirectionHandler.reversePlacementDirection(placementDirection);

        for (const node of initialStream.getFlow(placementDirection)) {
            const nodeStream = new NodeStream(node);
            nodeStream.elaborateNodesFlow(reverseDirection);
            if (!this.validateStream(reverseDirection, nodeStream)) return false;
        }

        if (this.longestWordLength < MIN_WORD_LENGTH) return false;
        return true;
    }
    private validateStream(placementDirection: PlacementDirections, stream: NodeStream) {
        const word = stream.getWord(placementDirection);
        if (word.length < MIN_WORD_LENGTH) return true;
        if (word.length > this.longestWordLength) this.longestWordLength = word.length;
        return this.isValidWord(word);
    }
    private isValidWord(word: string): boolean {
        return this.dictionaryReader.hasWord(word);
    }
}
