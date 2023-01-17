/* eslint-disable dot-notation */ // We need to access private attributes for our tests ant the linter does not like the notation used for it
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService, DATABASE_COLLECTION, DATABASE_NAME } from './database.service';
chai.use(chaiAsPromised);

const INITIAL_DB_SIZE = 10;
describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        if (databaseService['client'] && databaseService['client'].isConnected()) {
            await databaseService['client'].close();
        }
    });

    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).not.to.equal(undefined);
        expect(databaseService['db'].databaseName).to.equal(DATABASE_NAME);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        // Try to reconnect to local server
        try {
            await databaseService.start('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).to.equal(undefined);
        }
    });

    it('should no longer be connected if close is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        expect(databaseService['client'].isConnected()).to.equal(false);
    });

    it('should populate the database with a helper function', async () => {
        const mongoUri = await mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        databaseService['db'] = client.db(DATABASE_NAME);
        await databaseService.populateDB();
        const courses = await databaseService.database.collection(DATABASE_COLLECTION).find({}).toArray();
        expect(courses.length).to.equal(INITIAL_DB_SIZE);
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let scores = await databaseService.database.collection(DATABASE_COLLECTION).find({}).toArray();
        expect(scores.length).to.equal(INITIAL_DB_SIZE);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        scores = await databaseService.database.collection(DATABASE_COLLECTION).find({}).toArray();
        expect(scores.length).to.equal(INITIAL_DB_SIZE);
    });
});
