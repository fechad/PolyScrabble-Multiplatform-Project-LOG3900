import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { BIG_SCORE, EXTREME_SCORE, TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { GameLevel } from '@app/enums/game-level';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualPlayer } from './virtual-player';

export class VirtualPlayerAdaptative extends VirtualPlayer {
    playedSpecial: boolean;

    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
        scale?: AdaptiveScale,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel);
        this.playedSpecial = false;
        if (scale) this.intervalComputer.scale = scale;
    }

    protected override placeLettersAction(specialFilter: (placement: UserPlacement) => boolean = () => false): string {
        if (this.playedSpecial) {
            this.sendMessage(this.quotes.cheatAnnouncement, TOGGLE_PREFIX + this.pseudo);
            this.playedSpecial = false;
        }

        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        const scoreInterval = this.intervalComputer.scoreInterval;

        const specialPlacements = this.possiblePlacements.filter(specialFilter);
        const placements = specialPlacements.length > 0 ? specialPlacements : this.possiblePlacements;
        let filtered: UserPlacement[];
        let offset = 0;
        do {
            filtered = placements.filter(
                (placement) => placement.points >= scoreInterval.min - offset && placement.points <= scoreInterval.max + offset,
            );
            offset++;
        } while (filtered.length === 0);
        const chosenPlacement = filtered[Math.floor(Math.random() * filtered.length)];
        if (specialPlacements.length > 0) {
            this.sendMessage(this.quotes.angryAnnouncement, TOGGLE_PREFIX + this.pseudo);
            this.playedSpecial = true;
        } else if (chosenPlacement.points >= EXTREME_SCORE) this.sendMessage(this.quotes.extremeScore);
        else if (chosenPlacement.points > BIG_SCORE) this.sendMessage(this.quotes.bigScore);

        return `${FullCommandVerbs.PLACE} ${chosenPlacement.row}${chosenPlacement.col}${chosenPlacement.direction} ${chosenPlacement.letters}`;
    }
}
