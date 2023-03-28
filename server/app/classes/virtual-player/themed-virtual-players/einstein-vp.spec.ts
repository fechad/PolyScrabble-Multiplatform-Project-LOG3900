/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { SCALES } from '@app/constants/virtual-player-constants';
// import { IntervalComputer } from '@app/classes/virtual-player/interval-computer';
import { expect } from 'chai';
import { EinsteinVirtualPlayer } from './einstein-vp';

describe('Einstein virtual player', () => {
    const ANGRY_THRESHOLD = 1;
    let einsteinVp: EinsteinVirtualPlayer;
    const letterBank: LetterBank = new LetterBank();
    const manipulator: BoardManipulator = new BoardManipulator(letterBank.produceValueMap());
    beforeEach(() => {
        einsteinVp = new EinsteinVirtualPlayer('trump', false, manipulator, letterBank);
    });
    it('should become angry if gap is equal or over the threshold', () => {
        einsteinVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(einsteinVp.angryTurnsLeft).to.equal(2);
    });
    it('should not exit angry mode if gap is below threshold but it still has angry turns left', () => {
        einsteinVp.angryTurnsLeft = 2;

        einsteinVp.setScoreInterval(ANGRY_THRESHOLD - 1);
        expect((einsteinVp as any).intervalComputer.adaptiveScale).to.equal(SCALES.expert);
    });
    it('should refresh angry turns if the gap is still above the threshold', () => {
        einsteinVp.angryTurnsLeft = 2;

        einsteinVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(einsteinVp.angryTurnsLeft).to.equal(1);
        einsteinVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(einsteinVp.angryTurnsLeft).to.equal(0);
        einsteinVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(einsteinVp.angryTurnsLeft).to.equal(2);
    });
    it('should use default scale after it runs out of angry turns and the gap falls below the threshold', () => {
        einsteinVp.angryTurnsLeft = 1;

        einsteinVp.setScoreInterval(ANGRY_THRESHOLD);
        expect(einsteinVp.angryTurnsLeft).to.equal(0);
        expect((einsteinVp as any).intervalComputer.adaptiveScale).to.equal(SCALES.default);
    });
});
