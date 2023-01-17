/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { Application } from '@app/app';
import { Dictionary } from '@app/classes/dictionary';
import { ScoreMapper } from '@app/classes/virtual-placement-logic/score-mapper';
import { WordCollection } from '@app/classes/virtual-placement-logic/word-collection';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { BotsController } from '@app/controllers/bots.controller';
import { GamesHistoryController } from '@app/controllers/game.history.controller';
import { BotsService } from '@app/services/bot.service';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import { DictionariesService } from '@app/services/dictionaries.service';
import { GamesHistoryService } from '@app/services/games.history.service';
import { ScoresService } from '@app/services/score.service';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { describe } from 'mocha';
import { UpdateWriteOpResult, WriteOpResult } from 'mongodb';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { DictionariesController } from './dictionaries.controller';
import { ScoresController } from './scores.controller';

describe('DictionariesController', () => {
    let scoresController: ScoresController;
    let dictionariesController: DictionariesController;
    let dictionariesService: DictionariesService;
    let gamesHistoryService: GamesHistoryService;
    let gamesHistoryController: GamesHistoryController;
    let botsService: BotsService;
    let botsController: BotsController;
    let application: Application;
    let dictionaries: Dictionary[];
    let dictionaryWithoutWords: Dictionary;
    let scoresService: ScoresService;

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
        dictionaries = [{ title: 'anglais', description: 'la langue de Shakespeare' }];
        dictionaryWithoutWords = { title: 'rutherford', description: 'la ....' };
    });

    afterEach(async () => {
        sinon.restore();
    });
    describe('GET /api/dictionaries route', () => {
        it('should return http status 200 and the correct dictionaries from the server', async () => {
            sinon.stub(dictionariesService, 'getAllDictionaries').resolves(dictionaries);
            return request(application.app)
                .get('/api/dictionaries')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(dictionaries);
                });
        });
        it('When getAllDictionaries rejects, it should return Status 404', async () => {
            sinon.stub(dictionariesService, 'getAllDictionaries').rejects(dictionaries);
            return request(application.app)
                .get('/api/dictionaries')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
    });
    describe('DELETE /api/dictionaries route', () => {
        it('should call deleteAllDictionariesExceptDefault and return status 200 when is resolves', async () => {
            const stub = sinon.stub(dictionariesService, 'deleteAllDictionariesExceptDefault').resolves({} as WriteOpResult);
            sinon.stub(dictionariesService, 'getAllDictionaries').resolves([] as Dictionary[]);
            const fileServiceStub = sinon.stub(dictionariesController.fileService, 'deleteAllDictionariesExceptDefault');
            return request(application.app)
                .delete('/api/dictionaries')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(stub.called).to.equal(true);
                    expect(response.body).to.deep.equal({});
                    expect(fileServiceStub.called).to.equal(true);
                });
        });
        it('should return Status 404 when  deleteAllDictionariesExceptDefault rejects', async () => {
            const stub = sinon.stub(dictionariesService, 'deleteAllDictionariesExceptDefault').rejects(dictionaries);
            sinon.stub(dictionariesService, 'getAllDictionaries').resolves([] as Dictionary[]);
            const fileServiceStub = sinon.stub(dictionariesController.fileService, 'deleteAllDictionariesExceptDefault');
            return request(application.app)
                .delete('/api/dictionaries')
                .expect(StatusCodes.NOT_FOUND)
                .then(() => {
                    expect(stub.called).to.equal(true);
                    expect(fileServiceStub.called).to.equal(false);
                });
        });
    });
    describe('GET /api/dictionaries/:title route', () => {
        it('should GONE when the dictionary no longer exists', async () => {
            sinon.stub(dictionariesService, 'getDictionary').resolves(null);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}?includeWords=false`)
                .expect(StatusCodes.GONE)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        it('When getDictionary rejects, it should return NOT FOUND (404)', async () => {
            sinon.stub(dictionariesController['fileService'], 'getDictionaryWords').resolves(['soy', 'estoy']);
            sinon.stub(dictionariesService, 'getDictionary').rejects(dictionaries[0]);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}?includeWords=false`)
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
        it('should not return a dictionary with words when the query parameter includeWords is false', async () => {
            sinon.stub(dictionariesController['fileService'], 'getDictionaryWords').resolves(['soy', 'estoy']);
            sinon.stub(dictionariesService, 'getDictionary').resolves(dictionaryWithoutWords);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}?includeWords=false`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(dictionaryWithoutWords);
                    sinon.restore();
                });
        });
        it('should not return a dictionary with words when the query parameter includeWords is not set', async () => {
            const stub = sinon.stub(dictionariesController['fileService'], 'getDictionaryWords').resolves(['soy', 'estoy']);
            sinon.stub(dictionariesService, 'getDictionary').resolves(dictionaryWithoutWords);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(dictionaryWithoutWords);
                    expect(stub.called).to.equal(false);
                    sinon.restore();
                });
        });
        it('should return a dictionary with words when the query parameter includeWords is true', async () => {
            sinon.stub(dictionariesController['fileService'], 'getDictionaryWords').resolves(['soy', 'estoy']);
            sinon.stub(dictionariesService, 'getDictionary').resolves(dictionaryWithoutWords);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}?includeWords=true`)
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body.words).to.deep.equal(['soy', 'estoy']);
                    expect(response.body.title).to.deep.equal(dictionaryWithoutWords.title);
                    expect(response.body.description).to.deep.equal(dictionaryWithoutWords.description);
                    sinon.restore();
                });
        });
        it('when getDictionaryWords resolves with undefined, it should send the code INTERNAL_SERVER_ERROR (500)', async () => {
            sinon.stub(dictionariesController['fileService'], 'getDictionaryWords').resolves(undefined);
            sinon.stub(dictionariesService, 'getDictionary').resolves(dictionaryWithoutWords);
            return request(application.app)
                .get(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}?includeWords=true`)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
    });
    describe('DELETE /api/dictionaries/:title route', () => {
        it('should return http status 200 and the correct dictionaries from the server', async () => {
            sinon.stub(dictionariesService, 'deleteDictionary').resolves();
            return request(application.app)
                .delete('/api/dictionaries/english')
                .expect(StatusCodes.OK)
                .then((response) => {
                    expect(response.body).to.deep.equal('');
                });
        });
        it('When deleteDictionary rejects, it should return Status 404', async () => {
            sinon.stub(dictionariesService, 'deleteDictionary').rejects();
            return request(application.app)
                .delete('/api/dictionaries/english')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        it('should return Status 403 (forbidden) when trying to delete the default dictionary', async () => {
            const stub = sinon.stub(dictionariesService, 'deleteDictionary').resolves();
            return request(application.app)
                .delete(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}`)
                .expect(StatusCodes.FORBIDDEN)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    assert(stub.notCalled, 'deleteDIcitonary has been called');
                });
        });
    });
    describe('PATCH /api/dictionaries/:title route', () => {
        it('When updateDictionary rejects, it should return Status 404', async () => {
            sinon.stub(dictionariesService, 'updateDictionary').rejects();
            return request(application.app)
                .patch('/api/dictionaries/english')
                .expect(StatusCodes.NOT_FOUND)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });
        it('should return Status 403 (forbidden) when trying to update the default dictionary', async () => {
            const stub = sinon.stub(dictionariesService, 'updateDictionary').resolves();
            return request(application.app)
                .patch(`/api/dictionaries/${DEFAULT_DICTIONARY_TITLE}`)
                .expect(StatusCodes.FORBIDDEN)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    assert(stub.notCalled, 'updateDictionary has been called');
                });
        });
        it('should return status forbidden when trying to edit a dictionary to have the same title as another one', async () => {
            const stub = sinon.stub(dictionariesService, 'getDictionary').resolves(dictionaryWithoutWords);
            return request(application.app)
                .patch('/api/dictionaries/hola')
                .expect(StatusCodes.FORBIDDEN)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    assert(stub.called, 'updateDictionary has not been called');
                });
        });
        it('should return status INTERNAL_SERVER_ERROR when no modification was made to the database', async () => {
            sinon.stub(dictionariesService, 'getDictionary').resolves(null);
            const stub = sinon.stub(dictionariesService, 'updateDictionary').resolves({ modifiedCount: 0 } as UpdateWriteOpResult);
            return request(application.app)
                .patch('/api/dictionaries/hola')
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    assert(stub.called, 'updateDictionary has not been called');
                });
        });
        it('should return status OK when the update is successful', async () => {
            sinon.stub(dictionariesService, 'getDictionary').resolves(null);
            const stub = sinon.stub(dictionariesService, 'updateDictionary').resolves({ modifiedCount: 1 } as UpdateWriteOpResult);
            return request(application.app)
                .patch('/api/dictionaries/hola')
                .expect(StatusCodes.OK)
                .then(() => {
                    assert(stub.called, 'updateDictionary has not been called');
                });
        });
    });
    describe('POST /api/dictionaries/:title route', () => {
        it('should return http status 201 (Created) and an empty body when the ressource is added successfully', async () => {
            sinon.stub(ScoreMapper, 'createMap').returns(new Map<number, WordCollection>());
            sinon.stub(dictionariesController.fileService, 'createDictionaryFile').resolves();
            sinon.stub(dictionariesService, 'addDictionary').resolves({ upsertedCount: 1 } as UpdateWriteOpResult);
            return request(application.app)
                .post('/api/dictionaries/english')
                .send({ title: 'yes', description: 'no', words: ['yeno'] } as Dictionary)
                .expect(StatusCodes.CREATED)
                .then(() => {
                    return;
                });
        });
        it('When updateDictionary rejects, it should return Status 500 (interfanl server error)', async () => {
            sinon.stub(dictionariesService, 'addDictionary').rejects();
            return request(application.app)
                .post('/api/dictionaries/english')
                .send({ title: 'yes', description: 'no', words: ['yeno'] } as Dictionary)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    sinon.restore();
                });
        });
        it('should return Status 403 (forbidden) when trying to add a dictionary that exist already', async () => {
            const stub = sinon.stub(dictionariesService, 'addDictionary').resolves({ upsertedCount: 0 } as UpdateWriteOpResult);
            return request(application.app)
                .post('/api/dictionaries/english')
                .send({ title: 'yes', description: 'no', words: ['yeno'] } as Dictionary)
                .expect(StatusCodes.CONFLICT)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                    assert(stub.called, 'updateDictionary has been called');
                    sinon.restore();
                });
        });
    });
});
