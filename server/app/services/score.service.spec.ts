import { Score } from '@app/classes/score';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import { ScoresService } from '@app/services/score.service';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { assert } from 'console';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import * as sinon from 'sinon';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('ScoresService', () => {
    let scoresService: ScoresService;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;
    const isoDate = '2022-03-16T14:26:51.458Z';
    let log2990Score1: Score;
    let log2990Score2: Score;
    let classicScore1: Score;
    let classicScore2: Score;
    before(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        // as any is used to test ScoresService with a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scoresService = new ScoresService(databaseService as any);
    });
    beforeEach(() => {
        scoresService.collection.remove({});
        log2990Score1 = { points: 10, author: 'Alfred', gameType: 'LOG2990', dictionary: 'English', date: isoDate };
        log2990Score2 = { points: 20, author: 'Bob', gameType: 'LOG2990', dictionary: 'English', date: isoDate };
        classicScore1 = { points: 30, author: 'Carl', gameType: 'Classic', dictionary: 'English', date: isoDate };
        classicScore2 = { points: 40, author: 'Diego', gameType: 'Classic', dictionary: 'English', date: isoDate };
    });

    after(async () => {
        // eslint-disable-next-line dot-notation -- we want to set the client as undefined
        databaseService['client'] = undefined as unknown as MongoClient;
        await databaseService.closeConnection();
    });
    describe('fetchAllScores() tests', () => {
        it('should get all scores from DB and they should be sorted (descending) by score', async () => {
            await scoresService.collection.insertOne(log2990Score1);
            await scoresService.collection.insertOne(log2990Score2);
            const scores = await scoresService.getAllScores();
            expect(scores.length).to.equal(2);
            expect(scores[0]).to.deep.equals(log2990Score2);
            expect(scores[1]).to.deep.equals(log2990Score1);
        });
    });
    describe('getBestScoresByGameType(category, quantity) tests', () => {
        it('should return all of the scores of a specified category when the quantity is not specified', async () => {
            await scoresService.collection.insertMany([classicScore1, log2990Score1]);
            const result = await scoresService.getBestScoresByGameType('LOG2990');
            expect(result.length).to.deep.equal(1);
            expect(result[0]).to.deep.equal(log2990Score1);
        });

        it('should return all of the scores of certain category and they should be sorted by points in descending order', async () => {
            await scoresService.collection.insertMany([log2990Score1, classicScore1, log2990Score2, classicScore2]);
            const result = await scoresService.getBestScoresByGameType('Classic');
            expect(result.length).to.equal(2);
            expect(result[0]).to.deep.equal(classicScore2);
            expect(result[1]).to.deep.equal(classicScore1);
        });
        it('should return an empty array when the quantity specified is 0', async () => {
            await scoresService.collection.insertMany([log2990Score1, log2990Score2]);
            const result = await scoresService.getBestScoresByGameType('LOG2990', 0);
            expect(result.length).to.equal(0);
        });

        it('should return an empty array when the quantity specified is negative', async () => {
            await scoresService.collection.insertMany([log2990Score1, log2990Score2]);
            const negativeQuantity = -1;
            const result = await scoresService.getBestScoresByGameType('LOG2990', negativeQuantity);
            expect(result.length).to.equal(0);
        });
        it('should return an empty array when the category does not exist in the DB and the quantity does not exist', async () => {
            await scoresService.collection.insertMany([log2990Score1, log2990Score2]);
            const result = await scoresService.getBestScoresByGameType('LOG6');
            expect(result.length).to.equal(0);
        });
        it('should return an empty array when the category does not exist in the DB and the quantity exists', async () => {
            await scoresService.collection.insertMany([log2990Score1, log2990Score2]);
            const quantity = 1;
            const result = await scoresService.getBestScoresByGameType('LOG6', quantity);
            expect(result.length).to.equal(0);
        });
        it('should not modify the content of the database', async () => {
            await scoresService.collection.insertOne(log2990Score1);
            const initialDBSize = 1;
            await scoresService.getBestScoresByGameType('LOG2990', 1);
            const sizeAfterGet = await scoresService.collection.countDocuments();
            const content = await scoresService.collection.find({}).toArray();
            expect(sizeAfterGet).to.equal(initialDBSize);
            expect(content[0]).to.deep.equal(log2990Score1);
        });
        it('when two scores have the same number of points, it should return them sorted by date (newest to oldest)', async () => {
            const score1: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: '2022-03-16T14:00:00.333Z' };
            const score2: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: '2022-03-16T14:00:00.443Z' };
            const score3: Score = { points: 50, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: '2022-03-16T14:00:00.443Z' };
            await scoresService.collection.insertMany([score1, score3, score2]);
            const result = await scoresService.getBestScoresByGameType('LOG2990');
            expect(result.length).to.deep.equal(3);
            expect(result[0]).to.deep.equal(score2);
            expect(result[1]).to.deep.equal(score1);
            expect(result[2]).to.deep.equal(score3);
        });
    });

    describe('udpadeBestScore() tests', () => {
        it('should add a score associated with a user when he does not have one in the DB', async () => {
            await scoresService.updateBestScore(log2990Score1);
            const scores = await scoresService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(scores.find((score) => score.author === log2990Score1.author)).to.deep.equals(log2990Score1);
        });
        it('should not remove/modify the old score of a user if he got a better one', async () => {
            const oldScore: Score = { points: 20, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            const newScore: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            await scoresService.collection.insertOne(oldScore);
            const result = await scoresService.updateBestScore(newScore);
            const scores = await scoresService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(scores.length).to.equal(2);
            expect(result.modifiedCount).to.equal(0);
            expect(scores.find((score) => score.points === newScore.points)).to.deep.equals(newScore);
        });
        it('should add a new score associated with a user even though it is SMALLER than his best score', async () => {
            const oldScore: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            const newScore: Score = { points: 20, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            await scoresService.collection.insertOne(oldScore);
            const result = await scoresService.updateBestScore(newScore);
            const scores = await scoresService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(scores.length).to.equal(2);
            expect(result.modifiedCount).to.equal(0);
            expect(scores.find((score) => score.points === newScore.points)).to.deep.equals(newScore);
        });

        it('when a user did not beat his best score, it should simply update the date', async () => {
            const oldScore: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            const newScore: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: new Date().toISOString() };
            await scoresService.collection.insertOne(oldScore);
            const result = await scoresService.updateBestScore(newScore);
            const scores = await scoresService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(scores.length).to.equal(1);
            expect(result.modifiedCount).to.equal(1);
            expect(scores.find((score) => score.points === newScore.points)).to.deep.equals(newScore);
        });
    });

    describe('reinitializeScores tests', () => {
        it('should call the correct methods on reinitializeScores', () => {
            const removeStub = sinon.stub(scoresService.collection, 'remove');
            const populateDBStub = sinon.stub(databaseService, 'populateDB');
            scoresService.reinitializeScores();
            assert(removeStub.called, 'did not call remove() on reinitializeScores');
            assert(populateDBStub.called, 'did not call databaseService.populateScore on reinitializeScore');
        });

        it('should clear the scores collection before adding the default one', async () => {
            const score: Score = { points: 100, author: 'Bob', gameType: 'LOG2990', dictionary: 'english', date: isoDate };
            await scoresService.collection.insertOne(score);
            scoresService.reinitializeScores();
            expect((await scoresService.collection.find({}).toArray()).length).to.equal(0);
        });
    });

    describe('Error handling', async () => {
        it('should throw an error if we try to get all scores on a closed connection', async () => {
            await client.close();
            expect(scoresService.getAllScores()).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to get the best scores on a closed connection', async () => {
            await client.close();
            expect(scoresService.getBestScoresByGameType('LOG2990')).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to update the scores on a closed connection', async () => {
            await client.close();
            expect(scoresService.updateBestScore(log2990Score1)).to.eventually.be.rejectedWith(Error);
        });
    });
});
