import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { GameLevel } from '@app/enums/game-level';
import { VirtualPlayer } from './virtual-player';

export class VirtualPlayerAdaptative extends VirtualPlayer {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel);
    }
}
