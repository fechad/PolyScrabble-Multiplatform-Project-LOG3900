import { Application } from '@app/app';
import { Game } from '@app/interfaces/firestoreDB/game';
import { BotsService } from '@app/services/bot.service';
import { DictionariesService } from '@app/services/dictionaries.service';
import { GamesHistoryService } from '@app/services/games.history.service';
import { ScoresService } from '@app/services/score.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { BotsController } from './bots.controller';
import { DictionariesController } from './dictionaries.controller';
import { GamesHistoryController } from './game.history.controller';
import { ImageController } from './image.controllet';
import { ScoresController } from './scores.controller';
import { UserInfoController } from './user-info.controller';

describe('GamesHistoryController', () => {
    let scoresController: ScoresController;
    let scoresService: ScoresService;
    let dictionariesController: DictionariesController;
    let dictionariesService: DictionariesService;
    let botsService: BotsService;
    let botsController: BotsController;
    let gamesHistoryService: GamesHistoryService;
    let gamesHistoryController: GamesHistoryController;
    let authController: AuthController;
    let imageController: ImageController;
    let userInfoController: UserInfoController;
    let application: Application;
    let games: Game[];

    before(async () => {
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scoresService = new ScoresService({} as any);
        scoresController = new ScoresController(scoresService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dictionariesService = new DictionariesService({} as any);
        dictionariesController = new DictionariesController(dictionariesService);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        botsService = new BotsService({} as any);
        botsController = new BotsController(botsService);
        imageController = new ImageController();
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authController = new AuthController({} as any, {} as any, {} as any);
        // as any is used to replace the real DB service by a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gamesHistoryService = new GamesHistoryService({} as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userInfoController = new UserInfoController({} as any);
        gamesHistoryController = new GamesHistoryController(gamesHistoryService);
        application = new Application(
            scoresController,
            dictionariesController,
            botsController,
            gamesHistoryController,
            authController,
            userInfoController,
            imageController,
        );
        games = [
            {
                startDatetime: 'date1',
                period: '1h30',
                botIDS: [],
                results: [
                    { playerID: 'game1player1', score: 20 },
                    { playerID: 'game1player2', score: 50 },
                ],
                gameType: 'classique',
                surrender: '',
            },
        ];
    });

    afterEach(async () => {
        sinon.restore();
    });
    describe('GET /api/games route', () => {
        it('should return http status 200 and the correct bots from the server', async () => {
            sinon.stub(gamesHistoryService, 'getGamesHistory').resolves(games);
            return request(application.app)
                .get('/api/games')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(games);
                    sinon.restore();
                });
        });
        it('When getGamesHistory rejects, it should return Status 404', async () => {
            sinon.stub(gamesHistoryService, 'getGamesHistory').rejects(games);
            return request(application.app)
                .get('/api/games')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
    });
    describe('DELETE /api/games route', () => {
        it('should return http status 200', async () => {
            sinon.stub(gamesHistoryService, 'deleteGames').resolves();
            return request(application.app)
                .delete('/api/games')
                .expect(StatusCodes.OK)
                .then(() => {
                    sinon.restore();
                });
        });
        it('When getGamesHistory rejects, it should return Status 404', async () => {
            sinon.stub(gamesHistoryService, 'deleteGames').rejects();
            return request(application.app).delete('/api/games').expect(StatusCodes.NOT_FOUND);
        });
    });
});
