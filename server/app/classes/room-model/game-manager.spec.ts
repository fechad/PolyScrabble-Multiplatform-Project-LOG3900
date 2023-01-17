import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { DEFAULT_DICTIONARY_PATH } from '@app/constants/constants';
import { PlacementDirections } from '@app/enums/placement-directions';
import { PlacementData } from '@app/interfaces/placement-data';
import { expect } from 'chai';
import { assert } from 'console';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { GameManager } from './game-manager';

const palindromeWord = 'naan';
describe('GameManager tests', () => {
    const manager: GameManager = new GameManager(DEFAULT_DICTIONARY_PATH, true);
    const player1 = new Player('id', 'test', true);
    it('reached goals should return an empty array initially', () => {
        const data: PlacementData = { word: palindromeWord, row: 'h', column: 8, direction: PlacementDirections.Horizontal };
        manager.givePlayerGoals([player1]);
        manager.askPlacement(data, player1);

        assert(manager.reachedGoals.length === 0);
    });

    it('should call fetchAllGoals on allGoals', () => {
        const fetchAllGoalsSpy = sinon.spy(manager.goalManager, 'fetchAllGoals');
        const allGoals = manager.allGoals;
        assert(fetchAllGoalsSpy.called, 'did not call fetchAllGoals on allGoals');
        expect(allGoals).to.equal(manager.goalManager.fetchAllGoals());
    });

    describe('endGame tests', () => {
        const getPointsOfRackSpy = sinon.spy(player1.rack, 'getPointsOfRack');
        // eslint-disable-next-line dot-notation -- we want to access private attribute
        manager['letterBank'] = undefined as unknown as LetterBank;
        const previousScore = 10;
        player1.points = 10;

        it('should not update points on pass finish if there are no letters bank', () => {
            manager.updateScoreOnPassFinish([player1]);
            expect(player1.points).to.equal(previousScore);
            assert(getPointsOfRackSpy.notCalled, 'called getPointsOfRack when letterBank was undefined');
        });

        it('should not update points on pass finish if there are no letters bank', () => {
            manager.updateScoresOnPlaceFinish(player1, [player1]);
            expect(player1.points).to.equal(previousScore);
            assert(getPointsOfRackSpy.notCalled, 'called getPointsOfRack when letterBank was undefined');
        });
    });
});
