import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { SCALES, TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { Language } from '@app/enums/language';
import { einsteinEnglishQuotes, einsteinFrenchQuotes } from '@app/enums/themed-quotes/einstein-quotes';

// TODO: Place back 30
const ANGRY_THRESHOLD = 1;
export class EinsteinVirtualPlayer extends VirtualPlayer {
    angryTurnsLeft: number;
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.default, language);
        this.angryTurnsLeft = 0;
        this.setQuotes(einsteinFrenchQuotes, einsteinEnglishQuotes);
    }
    override setScoreInterval(gap: number): void {
        if (this.angryTurnsLeft < 1 && gap < ANGRY_THRESHOLD) return this.intervalComputer.setScoreInterval(gap);

        if (this.angryTurnsLeft < 1) {
            this.angryTurnsLeft = 3;
            this.sendMessage(this.quotes.angryAnnouncement, TOGGLE_PREFIX + this.pseudo);
        }
        this.intervalComputer.scale = SCALES.expert;

        this.intervalComputer.isRuthless = true;
        this.angryTurnsLeft -= 1;
        this.intervalComputer.setScoreInterval(gap);

        if (this.angryTurnsLeft >= 1) return;
        this.intervalComputer.scale = SCALES.default;
        this.intervalComputer.isRuthless = false;
        // TODO: Maybe implement a proper cooldown quote
        this.sendMessage(this.quotes.extremeScore, TOGGLE_PREFIX + this.pseudo);
    }

    protected override placeLettersAction(): string {
        if (this.angryTurnsLeft < 1) super.placeLettersAction();

        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        this.possiblePlacements.sort((leftPlacement, rightPlacement) => (leftPlacement.points || 0) - (rightPlacement.points || 0));
        const placement = this.possiblePlacements[this.possiblePlacements.length - 1];

        return `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`;
    }
}
