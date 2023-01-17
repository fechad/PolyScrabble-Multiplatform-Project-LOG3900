import { Bot } from '@app/interfaces/bot';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { BotsService } from './bot.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('BotService', () => {
    let botService: BotsService;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;
    let bot1: Bot;
    let bot2: Bot;
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        // as any is used to test ScoresService with a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        botService = new BotsService(databaseService as any);
    });
    beforeEach(() => {
        botService.collection.remove({});
        bot1 = { name: 'bot1', gameType: 'classic' };
        bot2 = { name: 'bot2', gameType: 'log2990' };
    });

    after(async () => {
        await databaseService.closeConnection();
    });
    describe('getAllBots() tests', () => {
        it('should get all the bots from DB', async () => {
            await botService.collection.insertOne(bot1);
            await botService.collection.insertOne(bot2);
            const scores = await botService.getAllBots();
            expect(scores.length).to.equal(2);
            expect(scores[0]).to.deep.equals(bot1);
            expect(scores[1]).to.deep.equals(bot2);
        });
    });

    describe('deleteBot tests', () => {
        it('should delete the bot on the DB', async () => {
            await botService.collection.insertOne(bot1);
            await botService.collection.insertOne(bot2);
            await botService.deleteBot(bot1.name);
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(bots.length).to.equal(1);
            expect(bots[0].name).to.equal(bot2.name);
            expect(bots[0].gameType).to.equal(bot2.gameType);
        });
        it('should not modify the DB when the name provided is not associated with a bot in it', async () => {
            await botService.collection.insertOne(bot1);
            await botService.deleteBot('Non existent bot');
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(bots.length).to.equal(1);
            expect(bots[0].name).to.equal(bot1.name);
            expect(bots[0].gameType).to.equal(bot1.gameType);
        });
    });
    describe('updateBot test', () => {
        it('should update the bot when it exists by the new one', async () => {
            await botService.collection.insertOne(bot1);
            await botService.updateBot(bot1.name, bot2);
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(bots.length).to.equal(1);
            expect(bots[0].name).to.equal(bot2.name);
            expect(bots[0].gameType).to.equal(bot2.gameType);
        });
        it('should add the bot to the DB when the bot to update is not in there', async () => {
            await botService.collection.insertOne(bot2);
            await botService.updateBot(bot1.name, bot1);
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(bots.length).to.equal(2);
            expect(bots[1].name).to.equal(bot1.name);
            expect(bots[1].gameType).to.equal(bot1.gameType);
        });
        it('should not update the name of a bot when there is already a bot with that name in the DB', async () => {
            await botService.collection.insertOne(bot2);
            const updatedBot: Bot = { name: bot2.name, gameType: bot2.gameType };
            const result = await botService.updateBot(bot2.name, updatedBot);
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(result.modifiedCount).to.equal(0);
            expect(bots[0].name).to.equal(bot2.name);
            expect(bots[0].gameType).to.equal(bot2.gameType);
        });
    });
    describe('Error handling', async () => {
        it('should throw an error if we try to get all bots on a closed connection', async () => {
            await client.close();
            expect(botService.getAllBots()).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to get all bots on a closed connection', async () => {
            await client.close();
            expect(botService.deleteBot(bot2.name)).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('deleteAllBots() tests', () => {
        let defaultBot1: Bot;
        let defaultBot2: Bot;
        let defaultBot3: Bot;
        let defaultBot4: Bot;
        let defaultBot5: Bot;
        let defaultBot6: Bot;

        beforeEach(async () => {
            defaultBot1 = { name: 'Trump', gameType: 'débutant' };
            defaultBot2 = { name: 'Zemmour', gameType: 'débutant' };
            defaultBot3 = { name: 'Legault', gameType: 'débutant' };
            defaultBot4 = { name: 'Ulrich', gameType: 'expert' };
            defaultBot5 = { name: 'Sami', gameType: 'expert' };
            defaultBot6 = { name: 'Augustin', gameType: 'expert' };
        });
        it('should not remove a bot with the name DEFAULT_BOT_NAME', async () => {
            await botService.collection.insertOne(defaultBot1);
            await botService.collection.insertOne(defaultBot2);
            await botService.collection.insertOne(defaultBot3);
            await botService.collection.insertOne(defaultBot4);
            await botService.collection.insertOne(defaultBot5);
            await botService.collection.insertOne(defaultBot6);

            await botService.deleteAllBots();
            const bots = await botService.collection.find({}, { projection: { _id: 0 } }).toArray();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(bots.length).to.equal(6);
            expect(bots[0].name).to.deep.equals(defaultBot1.name);
            expect(bots[1].name).to.deep.equals(defaultBot2.name);
            expect(bots[2].name).to.deep.equals(defaultBot3.name);
            expect(bots[3].name).to.deep.equals(defaultBot4.name);
            expect(bots[4].name).to.deep.equals(defaultBot5.name);
            expect(bots[5].name).to.deep.equals(defaultBot6.name);

            expect(bots[0].gameType).to.deep.equals(defaultBot1.gameType);
            expect(bots[1].gameType).to.deep.equals(defaultBot2.gameType);
            expect(bots[2].gameType).to.deep.equals(defaultBot3.gameType);
            expect(bots[3].gameType).to.deep.equals(defaultBot4.gameType);
            expect(bots[4].gameType).to.deep.equals(defaultBot5.gameType);
            expect(bots[5].gameType).to.deep.equals(defaultBot6.gameType);
        });
    });
});
