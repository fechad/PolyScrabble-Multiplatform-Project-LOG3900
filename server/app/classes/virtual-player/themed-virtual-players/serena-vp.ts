import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayerAdaptative } from '@app/classes/virtual-player/virtual-player-adaptative';
import { MAXIMUM_PLACEMENT_LENGTH, SCALES } from '@app/constants/virtual-player-constants';
import { GameLevel } from '@app/enums/game-level';
import { serenaEnglishQuotes, serenaFrenchQuotes } from '@app/enums/themed-quotes/serena-quotes';
import { UserPlacement } from '@app/interfaces/user-placement';

export class SerenaVirtualPlayer extends VirtualPlayerAdaptative {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel, SCALES.serena);
        this.setQuotes(serenaFrenchQuotes, serenaEnglishQuotes);
    }
    protected override placeLettersAction(): string {
        const specialFilter = (placement: UserPlacement) => placement.letters.length === MAXIMUM_PLACEMENT_LENGTH;
        return super.placeLettersAction(specialFilter);
    }
}
