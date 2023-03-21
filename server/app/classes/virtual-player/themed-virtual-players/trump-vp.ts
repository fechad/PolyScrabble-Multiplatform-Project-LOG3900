import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { SCALES, TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { GameLevel } from '@app/enums/game-level';
import { Language } from '@app/enums/language';
import { trumpEnglishQuotes, trumpFrenchQuotes } from '@app/enums/themed-quotes/trump-quotes';

const ANGRY_THRESHOLD = 30;
export class TrumpVirtualPlayer extends VirtualPlayer {
    hasCheated: boolean;
    angryTurnsLeft: number;
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel, SCALES.beginner, language);
        this.setQuotes(trumpFrenchQuotes, trumpEnglishQuotes);
        this.hasCheated = false;
        this.angryTurnsLeft = 0;
    }
    override setScoreInterval(gap: number): void {
        if (this.angryTurnsLeft < 1 && gap < ANGRY_THRESHOLD) return this.intervalComputer.setScoreInterval(gap);
        if (!this.hasCheated) {
            this.hasCheated = true;
            this.sendMessage(this.quotes.cheatAnnouncement, TOGGLE_PREFIX + this.pseudo);
            this.angryTurnsLeft = 2;
        }
        // TODO: add cheat logic
        if (this.angryTurnsLeft < 1) {
            this.angryTurnsLeft = 2;
            this.sendMessage(this.quotes.angryAnnouncement, TOGGLE_PREFIX + this.pseudo);
        }
        this.intervalComputer.scale = SCALES.angryTrump;

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
