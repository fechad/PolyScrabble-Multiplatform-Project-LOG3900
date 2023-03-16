/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Timer } from '@app/classes/timer';
import { VirtualPlayerActions } from '@app/enums/virtual-player-actions';
import { assert } from 'chai';
import sinon from 'sinon';
import { VirtualPlayerBeginner } from './virtual-player-beginner';

describe('chooseAction test', () => {
    let getActionStub: sinon.SinonStub;
    let virtualPlayerPrivateAccess: any;
    let letterBank;
    let manipulator;
    beforeEach(() => {
        sinon.restore();
        letterBank = new LetterBank();
        manipulator = new BoardManipulator(letterBank.produceValueMap());
        virtualPlayerPrivateAccess = new VirtualPlayerBeginner('bot', false, manipulator, letterBank) as any;
        getActionStub = sinon.stub(virtualPlayerPrivateAccess, 'getAction');
        sinon.stub(Timer, 'wait').resolves();
    });

    it('should return passTurnActions if action === PassTurn', async () => {
        getActionStub.callsFake(() => {
            return VirtualPlayerActions.PassTurn;
        });
        const passTurnActionSpy = sinon.spy(virtualPlayerPrivateAccess, 'passTurnAction');
        await virtualPlayerPrivateAccess.chooseAction();
        assert(passTurnActionSpy.called, 'did not call passTurnAction on chooseAction when action === placeLetters');
    });

    it('should return switchLettersActions if action === SwitchLetters', async () => {
        getActionStub.callsFake(() => {
            return VirtualPlayerActions.SwitchLetters;
        });
        const switchLettersActionSpy = sinon.spy(virtualPlayerPrivateAccess, 'switchLettersAction');
        virtualPlayerPrivateAccess.chooseAction();
        assert(switchLettersActionSpy.called, 'did not call switchLetterAction on chooseAction when action === switchLetters');
    });

    it('should return placeLettersActions if action === PlaceLetters', async () => {
        getActionStub.callsFake(() => {
            return VirtualPlayerActions.PlaceLetters;
        });
        const placeLettersActionSpy = sinon.spy(virtualPlayerPrivateAccess, 'placeLettersAction');
        virtualPlayerPrivateAccess.chooseAction();
        assert(placeLettersActionSpy.called, 'did not call placeLetterAction on chooseAction when action === placeLetters');
    });

    it('should pass turn if there are no other available action', async () => {
        virtualPlayerPrivateAccess.basis.level = 'Expert';
        getActionStub.callsFake(() => {
            return VirtualPlayerActions.PassTurn;
        });
        const passTurnActionSpy = sinon.spy(virtualPlayerPrivateAccess, 'passTurnAction');
        virtualPlayerPrivateAccess.chooseAction();
        assert(passTurnActionSpy.called, 'did not call passTurnAction if there is no action chosen');
    });
});
