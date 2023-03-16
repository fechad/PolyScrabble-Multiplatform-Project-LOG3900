import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { SCALES } from '@app/constants/virtual-player-constants';
import { GameLevel } from '@app/enums/game-level';

// TODO: Place back 30
const ANGRY_THRESHOLD = 10;
export class TrumpVirtualPlayer extends VirtualPlayer {
    hasCheated: boolean;
    angryTurnsLeft: number;
    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
    ) {
        super(pseudo, isCreator, boardManipulator, letterBank, desiredLevel, SCALES.beginner);
        this.hasCheated = false;
        this.angryTurnsLeft = 0;
    }
    override setScoreInterval(gap: number): void {
        if (this.angryTurnsLeft < 1 && gap < ANGRY_THRESHOLD) return this.intervalComputer.setScoreInterval(gap);

        // TODO: add cheat logic
        if (!this.hasCheated) this.hasCheated = true;

        if (this.angryTurnsLeft < 1) this.angryTurnsLeft = 2;
        this.intervalComputer.scale = SCALES.angryTrump;

        this.intervalComputer.isRuthless = true;
        this.angryTurnsLeft -= 1;
        this.intervalComputer.setScoreInterval(gap);

        if (this.angryTurnsLeft >= 1) return;
        this.intervalComputer.scale = SCALES.default;
        this.intervalComputer.isRuthless = false;
    }
}
