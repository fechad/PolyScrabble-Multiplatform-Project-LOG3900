import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { GameLevel } from '@app/enums/game-level';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { VirtualPlayer } from './virtual-player';

export class VirtualPlayerAdaptative extends VirtualPlayer {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
        scale?: AdaptiveScale,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel);
        if (scale) this.intervalComputer.scale = scale;
    }
}
