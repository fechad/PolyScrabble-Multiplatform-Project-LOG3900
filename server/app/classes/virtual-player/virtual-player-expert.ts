import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { SCALES } from '@app/constants/virtual-player-constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { Language } from '@app/enums/language';
import { VirtualPlayer } from './virtual-player';

export class VirtualPlayerExpert extends VirtualPlayer {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.expert, language);
    }

    override setScoreInterval() {
        return;
    }

    protected override placeLettersAction(): string {
        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        this.possiblePlacements.sort((leftPlacement, rightPlacement) => (leftPlacement.points || 0) - (rightPlacement.points || 0));
        const placement = this.possiblePlacements[this.possiblePlacements.length - 1];

        return `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`;
    }
}
