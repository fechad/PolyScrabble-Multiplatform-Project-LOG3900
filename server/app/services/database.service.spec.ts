/* eslint-disable dot-notation */ // We need to access private attributes for our tests ant the linter does not like the notation used for it
import { Account } from '@app/interfaces/firestoreDB/account';
import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Firestore } from 'firebase-admin/firestore';
import { describe } from 'mocha';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised);

describe('Database Service', () => {
    let databaseService: DatabaseService;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        databaseService.deleteCollection('test');
    });

    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        const db = await databaseService.start();
        expect(db).not.to.equal(undefined);
    });

    it('should be able to write multiple documents, get them with the correct interface, update and delete them', async () => {
        await databaseService.start();
        const usernames: string[] = ['DOOM BOT', 'BOT DOOM'];
        const emails: string[] = ['doom@bot.com', 'bot@doom.com'];
        const accounts: Account[] = [];
        let index = 0;
        for (const name of usernames) {
            const account: Account = {
                username: name,
                email: `${emails[index]}`,
                defaultLanguage: 'french',
                defaultTheme: 'DOOOOOOOM',
                highscore: 666,
                totalXP: -99999,
                badges: ['dev'],
                avatarUrl: 'url',
                bestGames: [],
                gamesPlayed: [],
            };
            accounts.push(account);
            index++;
        }

        const results = await databaseService.batchSave('test', accounts, (entry: Account) => entry.email);
        expect(results.length, 'creation of dummy accounts failed').to.equal(2);
        const readResults = await databaseService.getAllDocumentsFromCollection<Account>('test');

        expect(readResults, 'all documents read failed').to.include(readResults[0]);
        expect(readResults, 'all documents read failed').to.include(readResults[1]);

        const singleReadResult = await databaseService.getDocumentByID<Account>('test', emails[0]);
        expect(singleReadResult, 'single read failed').to.not.equal(undefined);

        const newInfo = accounts[0];
        const newHighscore = 1000;
        newInfo.highscore = newHighscore;
        await databaseService.updateDocumentByID('test', emails[0], newInfo);
        const updateResult = await databaseService.getDocumentByID<Account>('test', emails[0]);
        expect(updateResult?.highscore, 'update not successful').to.equal(newHighscore);

        const fieldDeleteResult = await databaseService.deleteDocumentByField('test', 'username', 'DOOM BOT');
        expect(fieldDeleteResult, 'deletion of first dummy failed').not.to.equal(undefined);

        const idDeleteResult = await databaseService.deleteDocumentByID('test', emails[1]);
        expect(idDeleteResult, 'deletion of first dummy failed').not.to.equal(undefined);
    });

    it('should delete a collection and its subcollections at the same time', async () => {
        let db = await databaseService.start();
        db = db as Firestore;
        const testCollectionRef = await db.collection('test');
        await testCollectionRef?.doc('subtestDoc').collection('subcollection');
        databaseService.deleteCollection('test');

        const deletedTestCollection = await db.collection('test').get();
        expect(deletedTestCollection.empty, 'collection not deleted').to.equal(true);

        const deletedSubtestDoc = await db.collection('test').doc('subtestDoc').get();
        expect(deletedSubtestDoc.exists, 'subsetDoc not deleted').to.equal(false);

        const deletedSubcollection = await db.collection('test').doc('subtestDoc').collection('subcollection').get();
        expect(deletedSubcollection.empty, 'subcollection not deleted').to.equal(true);
    });
});
