import { Dictionary } from '@app/classes/dictionary';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DictionariesService } from './dictionaries.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('DictionariesService', () => {
    let dictionariesService: DictionariesService;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;
    let dictionary1: Dictionary;
    let dictionary2: Dictionary;
    before(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        // as any is used to test DictionariesService with a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dictionariesService = new DictionariesService(databaseService as any);
    });
    beforeEach(() => {
        dictionariesService.collection.remove({});
        dictionary1 = { title: 'anglais', description: 'langue de Shakespeare', words: ['hey'] };
        dictionary2 = { title: 'français', description: 'langue de Molière', words: ['you'] };
    });

    after(async () => {
        await databaseService.closeConnection();
    });
    describe('getAllDictionaries() tests', () => {
        it('should get all the dictionaries from DB and they should be sorted', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.collection.insertOne(dictionary2);
            const dictionaries = await dictionariesService.getAllDictionaries();
            expect(dictionaries.length).to.equal(2);
            expect(dictionaries[0].title).to.deep.equals(dictionary1.title);
            expect(dictionaries[1].title).to.deep.equals(dictionary2.title);
        });
        it('should not return the document id', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            const dictionaries = await dictionariesService.getAllDictionaries();
            const attributes = Object.keys(dictionaries[0]);
            expect(attributes.includes('_id')).to.equal(false);
        });
    });
    describe('deleteAllDictionariesExceptDefault() tests', () => {
        let defaultDictionary: Dictionary;
        beforeEach(async () => {
            defaultDictionary = { title: DEFAULT_DICTIONARY_TITLE, description: '...' };
        });
        it('should not remove a dictionary with the title DEFAULT_DICTIONARY_TITLE', async () => {
            await dictionariesService.collection.insertOne(defaultDictionary);
            await dictionariesService.deleteAllDictionariesExceptDefault();
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.deep.equals(defaultDictionary.title);
            expect(dictionaries[0].title).to.deep.equals(DEFAULT_DICTIONARY_TITLE);
            expect(dictionaries[0].description).to.deep.equals(defaultDictionary.description);
        });
        it('should remove all of the dictionaries without the title DEFAULT_DICTIONARY_TITLE', async () => {
            await dictionariesService.collection.insertOne(defaultDictionary);
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.collection.insertOne(dictionary2);
            await dictionariesService.deleteAllDictionariesExceptDefault();
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.deep.equals(defaultDictionary.title);
            expect(dictionaries[0].title).to.deep.equals(DEFAULT_DICTIONARY_TITLE);
            expect(dictionaries[0].description).to.deep.equals(defaultDictionary.description);
        });
        it('THe number of documents in the db should remain 0 when it contains 0', async () => {
            await dictionariesService.deleteAllDictionariesExceptDefault();
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(0);
        });
    });

    describe('getDictionary tests', () => {
        it('should resolves into null when the title is empty', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            const dictionary = await dictionariesService.getDictionary('');
            expect(dictionary).to.equal(null);
        });
        it('should return a dictionary with the correct title and description when it exists in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            const dictionary = await dictionariesService.getDictionary(dictionary1.title);
            expect(dictionary).not.to.equal(null);
            expect(dictionary?.title).to.equal(dictionary1.title);
            expect(dictionary?.description).to.equal(dictionary1.description);
        });
        it('should return null when the dictionary does not exist in the DB', async () => {
            const dictionary = await dictionariesService.getDictionary(dictionary1.title);
            expect(dictionary).to.equal(null);
        });
    });

    describe('deleteDictionary tests', () => {
        it('should delete the dictionary on the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.collection.insertOne(dictionary2);
            await dictionariesService.deleteDictionary(dictionary1.title);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.equal(dictionary2.title);
            expect(dictionaries[0].description).to.equal(dictionary2.description);
        });
        it('should not modify the DB when the title provided is not associated with a dictionary in it', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.deleteDictionary('title not in the DB');
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.equal(dictionary1.title);
            expect(dictionaries[0].description).to.equal(dictionary1.description);
        });
    });
    describe('updateDictionary test', () => {
        it('should update the dictionary when it exists and the new title is not in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.updateDictionary(dictionary1.title, dictionary2);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.equal(dictionary2.title);
            expect(dictionaries[0].description).to.equal(dictionary2.description);
        });
        it('should not update the DB when the dictionary to update is not in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.updateDictionary('random title not in DB', dictionary2);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.equal(dictionary1.title);
            expect(dictionaries[0].description).to.equal(dictionary1.description);
        });
        it('should not update the name of a dictionary when there is already a dictionary with that name in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.collection.insertOne(dictionary2);
            const updatedDictionary: Dictionary = { title: dictionary2.title, description: dictionary1.description };
            const result = await dictionariesService.updateDictionary(dictionary1.description, updatedDictionary);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(result.modifiedCount).to.equal(0);
            expect(dictionaries[0].title).to.equal(dictionary1.title);
            expect(dictionaries[0].description).to.equal(dictionary1.description);
        });
    });

    describe('addDictionary tests', () => {
        it('should not add a dictionary if there is already one with the same title in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            const dictionary: Dictionary = { title: dictionary1.title, description: '...' };
            await dictionariesService.addDictionary(dictionary);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(1);
            expect(dictionaries[0].title).to.equal(dictionary1.title);
            expect(dictionaries[0].description).to.equal(dictionary1.description);
        });
        it('should add a dictionary if its title is different from all the ones in the DB', async () => {
            await dictionariesService.collection.insertOne(dictionary1);
            await dictionariesService.addDictionary(dictionary2);
            const dictionaries = await dictionariesService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(dictionaries.length).to.equal(2);
            expect(dictionaries[0].title).to.equal(dictionary1.title);
            expect(dictionaries[1].title).to.equal(dictionary2.title);
        });
    });
    describe('Error handling', async () => {
        it('should throw an error if we try to get all dictionaries on a closed connection', async () => {
            await client.close();
            expect(dictionariesService.getAllDictionaries()).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to get all dictionaries on a closed connection', async () => {
            await client.close();
            expect(dictionariesService.deleteDictionary(dictionary1.title)).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to addDictionary on a closed connection', async () => {
            await client.close();
            expect(dictionariesService.addDictionary(dictionary1)).to.eventually.be.rejectedWith(Error);
        });
    });
});
