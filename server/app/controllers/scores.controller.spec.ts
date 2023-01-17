import { Application } from '@app/app';
import { Score } from '@app/classes/score';
import { BotsService } from '@app/services/bot.service';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import { DictionariesService } from '@app/services/dictionaries.service';
import { GamesHistoryService } from '@app/services/games.history.service';
import { ScoresService } from '@app/services/score.service';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { BotsController } from './bots.controller';
import { DictionariesController } from './dictionaries.controller';
import { GamesHistoryController } from './game.history.controller';
import { ScoresController } from './scores.controller';

describe('ScoresController', () => {
    let scoresController: ScoresController;
    let scoresService: ScoresService;
    let dictionariesController: DictionariesController;
    let dictionariesService: DictionariesService;
    let gamesHistoryController: GamesHistoryController;
    let gamesHistoryService: GamesHistoryService;
    let botsService: BotsService;
    let botsController: BotsController;
    let application: Application;
    let scores: Score[];

    before(async () => {
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scoresService = new ScoresService(new DatabaseServiceMock() as any);
        scoresController = new ScoresController(scoresService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dictionariesService = new DictionariesService(new DatabaseServiceMock() as any);
        dictionariesController = new DictionariesController(dictionariesService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        botsService = new BotsService(new DatabaseServiceMock() as any);
        botsController = new BotsController(botsService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gamesHistoryService = new GamesHistoryService(new DatabaseServiceMock() as any);
        gamesHistoryController = new GamesHistoryController(gamesHistoryService);
        application = new Application(scoresController, dictionariesController, botsController, gamesHistoryController);
        scores = [{ points: 20, author: 'David', gameType: 'log2990', dictionary: 'English', date: new Date().toISOString() }];
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('should return http status 200 and the correct scores from the server', async () => {
        sinon.stub(scoresService, 'getAllScores').resolves(scores);
        return request(application.app)
            .get('/api/scores')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(scores);
            });
    });
    it('should return http status 404 and the correct scores from the server', async () => {
        sinon.stub(scoresService, 'getAllScores').rejects();
        return request(application.app).get('/api/scores').expect(StatusCodes.NOT_FOUND);
    });
    it('When getAllScores rejects, it should return Status 404', async () => {
        sinon.stub(scoresService, 'getAllScores').rejects(scores);
        return request(application.app)
            .get('/api/scores/')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal({});
                sinon.restore();
            });
    });

    describe('HTTP GET /api/scores/game-type/:gameType[?quantity] route', () => {
        it('should call getBestScoresByGameType only with the provided gameType when no quantity is in the route', async () => {
            const stub = sinon.stub(scoresService, 'getBestScoresByGameType').resolves(scores);
            const gameType = 'log2990';
            return request(application.app)
                .get(`/api/scores/game-type/${gameType}`)
                .expect(StatusCodes.OK)
                .then(() => {
                    assert(stub.called, 'getBestScoresByGameType was not called');
                    assert(stub.calledWith(gameType), 'getBestScoresByGameType was not called with the gameType');
                });
        });

        it('should call getBestScoresByGameType with the gameType and the specified quantity when both are provided', async () => {
            const stub = sinon.stub(scoresService, 'getBestScoresByGameType').resolves(scores);
            const gameType = 'log2990';
            const nScoresRequested = 1;
            return request(application.app)
                .get(`/api/scores/game-type/${gameType}?quantity=${nScoresRequested}`)
                .expect(StatusCodes.OK)
                .then(() => {
                    assert(stub.called, 'getBestScoresByGameType was not called');
                    assert(
                        stub.calledWith(gameType, nScoresRequested),
                        'getBestScoresByGameType was not called with the right gameType and quantity',
                    );
                });
        });
        it('Should return Status 200 (OK) and the correct scores', async () => {
            sinon.stub(scoresService, 'getBestScoresByGameType').resolves(scores);
            return request(application.app)
                .get('/api/scores/game-type/log2990')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(scores);
                });
        });
        it('HTTP GET /api/scores/game-type/:gameType should return the correct scores from the server', async () => {
            sinon.stub(scoresService, 'getBestScoresByGameType').resolves(scores);
            return request(application.app)
                .get('/api/scores/game-type/log2990')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(scores);
                    sinon.restore();
                });
        });
        it('When getBestScoresByGameType rejects, it should return Status 404', async () => {
            sinon.stub(scoresService, 'getBestScoresByGameType').rejects(scores);
            return request(application.app)
                .get('/api/scores/game-type/log2990')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
    });

    describe('DELETE /api/scores route', () => {
        it('should call reinitializeScores and return status 200 when is resolves', async () => {
            const reinitializeScoresStub = sinon.stub(scoresService, 'reinitializeScores');
            return request(application.app)
                .delete('/api/scores')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    expect(reinitializeScoresStub.called).to.equal(true);
                });
        });
        it('should return Status 404 when  reinitializeScores rejects', async () => {
            const reinitializeScoresStub = sinon.stub(scoresService, 'reinitializeScores').rejects();
            return request(application.app)
                .delete('/api/scores')
                .expect(StatusCodes.NOT_FOUND)
                .then(() => {
                    expect(reinitializeScoresStub.called).to.equal(true);
                });
        });
    });
});
