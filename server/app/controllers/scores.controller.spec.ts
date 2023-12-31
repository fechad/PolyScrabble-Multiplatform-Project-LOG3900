import { Application } from '@app/app';
import { Score } from '@app/interfaces/score';
import { Authentificator } from '@app/services/auth.service';
import { BotsService } from '@app/services/bot.service';
import { DatabaseService } from '@app/services/database.service';
import { EmailService } from '@app/services/email-service';
import { PlayerGameHistoryService } from '@app/services/GameEndServices/player-game-history.service';
import { ScoresService } from '@app/services/score.service';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { BotsController } from './bots.controller';
import { ImageController } from './image.controllet';
import { PlayerStatsController } from './player-stats-controller';
import { ScoresController } from './scores.controller';
import { UserInfoController } from './user-info.controller';

describe('ScoresController', () => {
    let scoresController: ScoresController;
    let scoresService: ScoresService;
    let gamesHistoryController: PlayerStatsController;
    let gamesHistoryService: PlayerGameHistoryService;
    let authController: AuthController;
    let botsService: BotsService;
    let botsController: BotsController;
    let userInfoController: UserInfoController;
    let application: Application;
    let imageController: ImageController;
    let scores: Score[];

    before(async () => {
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scoresService = new ScoresService({} as any);
        scoresController = new ScoresController(scoresService);
        authController = new AuthController({} as Authentificator, {} as DatabaseService, {} as EmailService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        botsService = new BotsService({} as any);
        botsController = new BotsController(botsService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gamesHistoryService = new PlayerGameHistoryService({} as any);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authController = new AuthController({} as any, {} as any, {} as any);
        imageController = new ImageController();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userInfoController = new UserInfoController({} as any);
        gamesHistoryController = new PlayerStatsController(gamesHistoryService);
        application = new Application(scoresController, botsController, gamesHistoryController, authController, userInfoController, imageController);
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
