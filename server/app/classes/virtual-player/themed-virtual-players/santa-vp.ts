import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { BIG_SCORE, EXTREME_SCORE, MAX_GAP_SANTA, SCALES } from '@app/constants/virtual-player-constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { Language } from '@app/enums/language';
import { santaEnglishQuotes, santaFrenchQuotes } from '@app/enums/themed-quotes/santa-quotes';
import { UserPlacement } from '@app/interfaces/user-placement';

export class SantaVirtualPlayer extends VirtualPlayer {
    hasCheated: boolean;
    angryTurnsLeft: number;
    gap: number;
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.beginner, language);
        this.setQuotes(santaFrenchQuotes, santaEnglishQuotes);
        this.hasCheated = false;
        this.angryTurnsLeft = 0;
        this.gap = 0;
    }

    setScoreInterval(gap: number = 0) {
        this.gap = gap;
        this.intervalComputer.setScoreInterval(gap);
    }

    protected placeLettersAction(): string {
        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        const scoreInterval = this.intervalComputer.scoreInterval;
        let filtered: UserPlacement[];
        let offset = 0;
        do {
            filtered = this.possiblePlacements.filter(
                (placement) =>
                    placement.points >= scoreInterval.min - offset &&
                    placement.points <= scoreInterval.max &&
                    this.gap - placement.points > MAX_GAP_SANTA,
            );
            offset++;
        } while (filtered.length === 0 && scoreInterval.min - offset > 0);
        if (filtered.length === 0) return this.switchLettersAction();

        const chosenPlacement = filtered[Math.floor(Math.random() * filtered.length)];
        if (chosenPlacement.points >= EXTREME_SCORE) this.sendMessage(this.quotes.extremeScore);
        else if (chosenPlacement.points > BIG_SCORE) this.sendMessage(this.quotes.bigScore);

        return `${FullCommandVerbs.PLACE} ${chosenPlacement.row}${chosenPlacement.col}${chosenPlacement.direction} ${chosenPlacement.letters}`;
    }
}
