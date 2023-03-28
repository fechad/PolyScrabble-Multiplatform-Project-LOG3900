import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Randomiser } from '@app/classes/randomiser';
import { MAX_RANDOM, WEIGHT_10, WEIGHT_40 } from '@app/constants/constants';
import { SCALES } from '@app/constants/virtual-player-constants';
import { Language } from '@app/enums/language';
import { VirtualPlayerActions } from '@app/enums/virtual-player-actions';
import { VirtualPlayer } from './virtual-player';

export class VirtualPlayerBeginner extends VirtualPlayer {
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        language: Language = Language.French,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, SCALES.beginner, language);
    }

    override setScoreInterval() {
        return;
    }

    protected override async chooseAction(): Promise<string> {
        const action = this.getAction();
        switch (action) {
            case VirtualPlayerActions.PassTurn:
                return this.passTurnAction();
            case VirtualPlayerActions.SwitchLetters:
                return this.switchLettersAction();
            case VirtualPlayerActions.PlaceLetters:
                return this.placeLettersAction();
            default:
                return this.passTurnAction();
        }
    }

    private getAction(): string {
        if (this.basis.actions.length <= 0) {
            this.basis.actions = Randomiser.getDistribution<string>(
                [
                    VirtualPlayerActions.PlaceLetters,
                    VirtualPlayerActions.PassTurn,
                    VirtualPlayerActions.PlaceLetters,
                    VirtualPlayerActions.SwitchLetters,
                ],
                [WEIGHT_40, WEIGHT_10, WEIGHT_40, WEIGHT_10],
                MAX_RANDOM,
            );
        }
        const index = Math.floor(this.basis.actions.length * Math.random());
        const action: string = this.basis.actions[index];
        this.basis.actions.splice(index, 1);
        return action;
    }
}
