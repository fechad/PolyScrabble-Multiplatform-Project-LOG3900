import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { SCALES, TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { Language } from '@app/enums/language';
import { trumpEnglishQuotes, trumpFrenchQuotes } from '@app/enums/themed-quotes/trump-quotes';

const ANGRY_THRESHOLD = 30;
export class TrumpVirtualPlayer extends VirtualPlayer {
    hasCheated: boolean;
    angryTurnsLeft: number;
    isAngry: boolean;
    mustKeepTurn: boolean;
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.beginner, language);
        this.setQuotes(trumpFrenchQuotes, trumpEnglishQuotes);
        this.hasCheated = false;
        this.mustKeepTurn = false;
        this.angryTurnsLeft = 0;
    }
    override setScoreInterval(gap: number): void {
        // This if statement is here so that we can switch him back to not angry after he plays the last angry move rather than during
        if (this.angryTurnsLeft < 0 && gap < ANGRY_THRESHOLD) this.calmDown();
        if (this.angryTurnsLeft < 1 && gap < ANGRY_THRESHOLD) return this.intervalComputer.setScoreInterval(gap);
        this.angryLogic(gap);
        if (this.angryTurnsLeft >= 1) return;
        this.angryTurnsLeft--;
    }
    private angryLogic(gap: number) {
        if (!this.hasCheated) {
            this.cheat();
        } else if (this.angryTurnsLeft < 1) {
            this.refreshAngry();
        }
        this.intervalComputer.scale = SCALES.angryTrump;

        this.intervalComputer.isRuthless = true;
        this.angryTurnsLeft--;
        this.intervalComputer.setScoreInterval(gap);
    }
    private calmDown() {
        this.intervalComputer.scale = SCALES.default;
        this.intervalComputer.isRuthless = false;
        // TODO: Maybe implement a proper cooldown quote
        this.sendMessage(this.quotes.extremeScore, TOGGLE_PREFIX + this.pseudo);
        this.angryTurnsLeft = 0;
        this.isAngry = false;
    }
    private cheat() {
        // TODO: add cheat logic
        this.hasCheated = true;
        this.mustKeepTurn = true;
        this.isAngry = true;
        this.angryTurnsLeft = 2;
        this.sendMessage(this.quotes.specialAnnouncement, TOGGLE_PREFIX + this.pseudo);
    }
    private refreshAngry() {
        if (!this.isAngry) {
            this.sendMessage(this.quotes.angryAnnouncement, TOGGLE_PREFIX + this.pseudo);
            this.isAngry = true;
        }
        this.angryTurnsLeft = 2;
    }
}
