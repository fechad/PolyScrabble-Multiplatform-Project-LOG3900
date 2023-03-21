import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { SCALES, TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { GameLevel } from '@app/enums/game-level';
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
        desiredLevel: string = GameLevel.Beginner,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel, SCALES.default);
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
}
