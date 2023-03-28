import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayerAdaptative } from '@app/classes/virtual-player/virtual-player-adaptative';
import { MOZART_LETTERS_FOR_SPECIAL_BEHAVIOUR, SCALES } from '@app/constants/virtual-player-constants';
import { Language } from '@app/enums/language';
import { mozartEnglishQuotes, mozartFrenchQuotes } from '@app/enums/themed-quotes/mozart-qutoes';
import { UserPlacement } from '@app/interfaces/user-placement';

export class MozartVirtualPlayer extends VirtualPlayerAdaptative {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.mozart, language);
        this.setQuotes(mozartFrenchQuotes, mozartEnglishQuotes);
    }

    protected override placeLettersAction(): string {
        const specialFilter = (placement: UserPlacement) =>
            !this.centerNode.content || placement.newWord.length - placement.letters.length >= MOZART_LETTERS_FOR_SPECIAL_BEHAVIOUR;
        return super.placeLettersAction(specialFilter);
    }

    /* protected override placeLettersAction(): string {
        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        const scoreInterval = this.intervalComputer.scoreInterval;

        let filtered: UserPlacement[];
        let completingWord: UserPlacement[] = this.possiblePlacements.filter(placement => this.isWordExtension(placement.letters, placement.newWord));
        const options = completingWord.length > 0 ? completingWord : this.possiblePlacements;
        
        let offset = 0;
        do {
            filtered = options.filter(
                (placement) => placement.points >= scoreInterval.min - offset && placement.points <= scoreInterval.max + offset,
            );
            offset++;
        } while (filtered.length === 0);
        const placement = filtered[Math.floor(Math.random() * filtered.length)];

        if (completingWord.length > 0) this.sendSpecialQuote(placement);

        return `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`;
    }

    private isWordExtension(letters: string, word: string) {
        return !this.centerNode.content || word.length - letters.length >= MOZART_LETTERS_FOR_SPECIAL_BEHAVIOUR;
    }*/
}
