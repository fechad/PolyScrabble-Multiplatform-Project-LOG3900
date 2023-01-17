import { BoardManipulator2990 } from '@app/classes/board-model/board-manipulator-2990';
import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { WordFetcher } from '@app/classes/virtual-placement-logic/word-fetcher';

export interface VirtualTools {
    fetcher: WordFetcher;
    translator: IndexationTranslator;
    manipulator: BoardManipulator | BoardManipulator2990;
    bank: LetterBank;
}
