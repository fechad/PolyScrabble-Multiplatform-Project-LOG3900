/* eslint-disable dot-notation */ // we want to access private attribute to test them
/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to test private methods
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Rack } from '@app/classes/rack';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { GameLevel } from '@app/enums/game-level';
import { PlacementDirections } from '@app/enums/placement-directions';
import { UserPlacement } from '@app/interfaces/user-placement';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { VirtualPlayer } from './virtual-player';

describe('VirtualPlayer tests', () => {
    let letterBank: LetterBank = new LetterBank();
    let manipulator: BoardManipulator;
    let virtualPlayer: VirtualPlayer;
    let virtualPlayerPrivateAccess: any;
    let rack: Rack;
    let possiblePlacements: UserPlacement[];
    const randomLetters = 'abcdefg';
    beforeEach(async () => {
        letterBank = new LetterBank();
        manipulator = new BoardManipulator(letterBank.produceValueMap());
        rack = new Rack(randomLetters);
        virtualPlayer = new VirtualPlayer('Botnet', false, manipulator, letterBank, 'débutant');
        virtualPlayer.rack = rack;
        virtualPlayerPrivateAccess = virtualPlayer as any;
        virtualPlayerPrivateAccess.possiblePlacements = possiblePlacements;
    });
    it('should return the correct level', () => {
        expect(virtualPlayer.level).to.equals('débutant');
    });
    it('should call chooseAction methods with the right action', async () => {
        const playTurnSpy = sinon.spy(virtualPlayer as any, 'chooseAction');
        virtualPlayer.playTurn();
        assert(playTurnSpy.called, 'did not call chooseAction on playTurn');
    });

    it('should return fullCommandsVerbs skip on passTurnAction', () => {
        expect(virtualPlayerPrivateAccess.passTurnAction()).to.equal(FullCommandVerbs.SKIP);
    });

    it('should return the letter of player rack and the switch command', () => {
        virtualPlayerPrivateAccess.switchLettersAction();
        expect(virtualPlayerPrivateAccess.switchLettersAction()).to.equal(`${FullCommandVerbs.SWITCH} ${rack.getLetters()}`);
    });

    describe('placeLettersAction tests', () => {
        let getPlacementStub: sinon.SinonStub;
        const placement: UserPlacement = {
            row: 'h',
            col: 8,
            direction: PlacementDirections.Horizontal,
            oldWord: '',
            newWord: '',
            letters: '',
            points: 0,
        };

        beforeEach(() => {
            getPlacementStub = sinon.stub(virtualPlayer['tools'].finder, 'getPlacement').callsFake(() => {
                return [];
            });
        });
        it('should call getPlacement on PlaceLettersAction', () => {
            virtualPlayerPrivateAccess.placeLettersAction();
            assert(getPlacementStub.called, 'did not call getPlacement on placeLettersAction');
        });
        it('should call switchLetterAction inside placeLetterAction method when possiblePlacement is empty', () => {
            virtualPlayer['possiblePlacements'] = [];
            const switchLetterSpy = sinon.spy(virtualPlayerPrivateAccess, 'switchLettersAction');
            virtualPlayerPrivateAccess.placeLettersAction();
            assert(switchLetterSpy.called, 'did not call  on switchLetterAction on placeLettersAction');
        });
        it('should take the first sorted placement if it finds new placements after initially being at 0', () => {
            virtualPlayer['possiblePlacements'] = [];
            getPlacementStub.callsFake(() => {
                return [placement];
            });
            expect(virtualPlayerPrivateAccess.placeLettersAction()).to.equal(
                `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`,
            );
        });
        it('should have a placement and return a place command with its placement', () => {
            getPlacementStub.callsFake(() => {
                return [placement];
            });
            expect(virtualPlayerPrivateAccess.placeLettersAction()).to.equal(
                `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`,
            );
        });
    });

    describe('Expert tests', () => {
        it('should call placeLetterActionExpert if the basisLevel is expert', () => {
            virtualPlayerPrivateAccess.basis.level = GameLevel.Expert;
            const placeLettersActionExpertSpy = sinon.spy(virtualPlayerPrivateAccess, 'placeLettersAction');
            virtualPlayerPrivateAccess.chooseAction();
            assert(placeLettersActionExpertSpy.called, 'did not call placeLettersAction on chooseAction when gameLevel was expert');
        });
    });
});
