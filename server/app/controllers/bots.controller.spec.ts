import { Application } from '@app/app';
import { Bot } from '@app/interfaces/bot';
import { BotsService } from '@app/services/bot.service';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import { DictionariesService } from '@app/services/dictionaries.service';
import { GamesHistoryService } from '@app/services/games.history.service';
import { ScoresService } from '@app/services/score.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { BotsController } from './bots.controller';
import { DictionariesController } from './dictionaries.controller';
import { GamesHistoryController } from './game.history.controller';
import { ScoresController } from './scores.controller';
import { WriteOpResult } from 'mongodb';

describe('BotsController', () => {
    let scoresController: ScoresController;
    let scoresService: ScoresService;
    let dictionariesController: DictionariesController;
    let dictionariesService: DictionariesService;
    let gamesHistoryController: GamesHistoryController;
    let gamesHistoryService: GamesHistoryService;
    let botsService: BotsService;
    let botsController: BotsController;
    let application: Application;
    let bots: Bot[];

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
        bots = [{ name: 'Huge', gameType: 'débutant' }];
    });

    afterEach(async () => {
        sinon.restore();
    });
    describe('GET /api/bots route', () => {
        it('should return http status 200 and the correct bots from the server', async () => {
            sinon.stub(botsService, 'getAllBots').resolves(bots);
            return request(application.app)
                .get('/api/bots')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(bots);
                });
        });
        it('When getAllBots rejects, it should return Status 404', async () => {
            sinon.stub(botsService, 'getAllBots').rejects(bots);
            return request(application.app)
                .get('/api/bots')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
    });

    describe('PATCH /api/bots/:name route', () => {
        it('should return http status 200 and an empty body', async () => {
            sinon.stub(botsService, 'updateBot').resolves();
            return request(application.app)
                .patch('/api/bots/Huge')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal('');
                });
        });
        it('When updateBot rejects, it should return Status 404', async () => {
            sinon.stub(botsService, 'updateBot').rejects();
            return request(application.app)
                .patch('/api/bots/Huge')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
    });
    describe('DELETE /api/bots/:name route', () => {
        it('should return http status 200 and the correct bots from the server', async () => {
            sinon.stub(botsService, 'deleteBot').resolves();
            return request(application.app)
                .delete('/api/bots/Huge')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal('');
                });
        });
        it('When botsService rejects, it should return Status 404', async () => {
            sinon.stub(botsService, 'deleteBot').rejects();
            return request(application.app)
                .delete('/api/bots/Huge')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        it('should return http status 200 and the correct bots from the server', async () => {
            sinon.stub(botsService, 'deleteBot').resolves();
            return request(application.app)
                .delete('/api/bots/Huge')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal('');
                });
        });
        it('When botsService rejects, it should return Status 404', async () => {
            sinon.stub(botsService, 'deleteBot').rejects();
            return request(application.app)
                .delete('/api/bots/Trump')
                .expect(StatusCodes.FORBIDDEN)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        describe('DELETE /api/bots route', () => {
            it('should return http status 200', async () => {
                sinon.stub(botsService, 'deleteAllBots').resolves();
                return request(application.app)
                    .delete('/api/bots')
                    .expect(StatusCodes.OK)
                    .then(() => {
                        sinon.restore();
                    });
            });
            it('should return http status 200 and the correct dictionaries from the server', async () => {
                sinon.stub(botsService, 'deleteAllBots').resolves();
                return request(application.app)
                    .delete('/api/bots')
                    .expect(StatusCodes.OK)
                    .then((response) => {
                        expect(response.body).to.deep.equal('');
                    });
            });
            it('When deleteBot rejects, it should return Status 404', async () => {
                sinon.stub(botsService, 'deleteBot').rejects();
                return request(application.app)
                    .delete('/api/bots')
                    .expect(StatusCodes.NOT_FOUND)
                    .then((response) => {
                        expect(response.body).to.deep.equal({});
                    });
            });
            it('When getAllBots rejects, it should return Status 404', async () => {
                sinon.stub(botsService, 'deleteAllBots').rejects();
                return request(application.app).delete('/api/bots').expect(StatusCodes.NOT_FOUND);
            });
            it('should call deleteAllBots and return status 200 when is resolves', async () => {
                const stub = sinon.stub(botsService, 'deleteAllBots').resolves({} as WriteOpResult);
                sinon.stub(botsService, 'getAllBots').resolves([] as Bot[]);
                return request(application.app)
                    .delete('/api/bots')
                    .expect(StatusCodes.OK)
                    .then((response) => {
                        expect(stub.called).to.equal(true);
                        expect(response.body).to.deep.equal({});
                    });
            });
            it('should return Status 404 when  deleteAllBots rejects', async () => {
                const stub = sinon.stub(botsService, 'deleteAllBots').rejects(bots);
                sinon.stub(botsService, 'getAllBots').resolves([] as Bot[]);
                return request(application.app)
                    .delete('/api/bots')
                    .expect(StatusCodes.NOT_FOUND)
                    .then(() => {
                        expect(stub.called).to.equal(true);
                    });
            });
        });
    });
});
