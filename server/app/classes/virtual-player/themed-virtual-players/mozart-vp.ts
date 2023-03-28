import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayerAdaptative } from '@app/classes/virtual-player/virtual-player-adaptative';
import {
    MOZART_LETTERS_FOR_SPECIAL_BEHAVIOUR,
    PLACEHOLDER_LETTERS_ALREADY_PLACED,
    PLACEHOLDER_NEW_WORD_PLACED,
    SCALES,
    TOGGLE_PREFIX,
} from '@app/constants/virtual-player-constants';
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

    protected sendSpecialQuote(placement: UserPlacement) {
        let quote = this.quotes.specialAnnouncement;
        let lettersAlready = placement.newWord;
        [...placement.letters].forEach((letter) => (lettersAlready = lettersAlready.replace(letter, '')));
        quote = quote.replace(PLACEHOLDER_LETTERS_ALREADY_PLACED, lettersAlready);
        quote = quote.replace(PLACEHOLDER_NEW_WORD_PLACED, placement.newWord);
        this.sendMessage(quote, TOGGLE_PREFIX + this.pseudo);
    }
}
