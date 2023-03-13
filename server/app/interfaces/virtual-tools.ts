import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';

export interface VirtualTools {
    translator: IndexationTranslator;
    manipulator: BoardManipulator;
    bank: LetterBank;
}
