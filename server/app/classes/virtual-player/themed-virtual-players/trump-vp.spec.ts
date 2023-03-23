/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { SCALES } from '@app/constants/virtual-player-constants';
// import { IntervalComputer } from '@app/classes/virtual-player/interval-computer';
import { expect } from 'chai';
import { TrumpVirtualPlayer } from './trump-vp';

describe('Tump virtual player', () => {
    const ANGRY_THRESHOLD = 30;
    let trumpVp: TrumpVirtualPlayer;
    const letterBank: LetterBank = new LetterBank();
    const manipulator: BoardManipulator = new BoardManipulator(letterBank.produceValueMap());
    beforeEach(() => {
        trumpVp = new TrumpVirtualPlayer('trump', false, manipulator, letterBank, 'Trump');
    });
    it('should become angry if gap is equal or over the threshold', () => {
        trumpVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(trumpVp.angryTurnsLeft).to.equal(1);
    });
    it('should not exit angry mode if gap is below threshold but it still has angry turns left', () => {
        trumpVp.angryTurnsLeft = 2;

        trumpVp.setScoreInterval(ANGRY_THRESHOLD - 1);
        expect((trumpVp as any).intervalComputer.adaptiveScale).to.equal(SCALES.angryTrump);
    });
    it('should refresh angry turns if the gap is still above the threshold', () => {
        trumpVp.angryTurnsLeft = 2;

        trumpVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(trumpVp.angryTurnsLeft).to.equal(1);
        trumpVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(trumpVp.angryTurnsLeft).to.equal(-1);
        trumpVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(trumpVp.angryTurnsLeft).to.equal(1);
    });
    it('should use default scale after it runs out of angry turns and the gap falls below the threshold', () => {
        trumpVp.angryTurnsLeft = 1;
        trumpVp.hasCheated = true;
        trumpVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(trumpVp.angryTurnsLeft).to.equal(-1);
        trumpVp.setScoreInterval(ANGRY_THRESHOLD - 1);
        expect(trumpVp.angryTurnsLeft).to.equal(0);
        expect((trumpVp as any).intervalComputer.adaptiveScale).to.equal(SCALES.default);
    });
});
