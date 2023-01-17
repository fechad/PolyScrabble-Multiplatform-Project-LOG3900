import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from '@app/services/database.service.mock';
import { Game } from '@app/interfaces/game';
import { GamesHistoryService } from './games.history.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('GamesHistoryService', () => {
    let gamesHistoryService: GamesHistoryService;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;
    let game1: Game;
    let game2: Game;
    before(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        // as any is used to test ScoresService with a mock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gamesHistoryService = new GamesHistoryService(databaseService as any);
    });
    beforeEach(() => {
        gamesHistoryService.collection.remove({});
        game1 = {
            date: 'date1',
            period: '1h30',
            player1: 'game1player1',
            scorePlayer1: 20,
            player2: 'game1player2',
            scorePlayer2: 50,
            gameType: 'classique',
            surrender: '',
        };
        game2 = {
            date: 'date2',
            period: '1h30',
            player1: 'game2player1',
            scorePlayer1: 10,
            player2: 'game2player2',
            scorePlayer2: 60,
            gameType: 'classique',
            surrender: 'Le mode solo est abandonné',
        };
    });

    after(async () => {
        await databaseService.closeConnection();
    });
    describe('getGamesHistory() tests', () => {
        it('should get all the games from DB', async () => {
            await gamesHistoryService.collection.insertOne(game1);
            await gamesHistoryService.collection.insertOne(game2);
            const games = await gamesHistoryService.getGamesHistory();
            expect(games.length).to.equal(2);
            expect(games[0]).to.deep.equals(game1);
            expect(games[1]).to.deep.equals(game2);
        });
    });
    describe('deleteGames() tests', () => {
        it('should delete all games from DB', async () => {
            await gamesHistoryService.collection.insertOne(game1);
            await gamesHistoryService.collection.insertOne(game2);
            await gamesHistoryService.deleteGames();
            const games = await gamesHistoryService.getGamesHistory();
            expect(games.length).to.equal(0);
        });
    });

    describe('updategame test', () => {
        it('should update the Game when it exists by the new one', async () => {
            await gamesHistoryService.collection.insertOne(game1);
            await gamesHistoryService.updateGame(game1.date, game2);
            const games = await gamesHistoryService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(games.length).to.equal(1);
            expect(games[0].date).to.equal(game2.date);
            expect(games[0].gameType).to.equal(game2.gameType);
        });
        it('should add the Game to the DB when the Game to update is not in there', async () => {
            await gamesHistoryService.collection.insertOne(game2);
            await gamesHistoryService.updateGame(game1.date, game1);
            const games = await gamesHistoryService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(games.length).to.equal(2);
            expect(games[1].date).to.equal(game1.date);
            expect(games[1].gameType).to.equal(game1.gameType);
        });
        it('should not update the date of a Game when there is already a Game with that name in the DB', async () => {
            await gamesHistoryService.collection.insertOne(game2);
            const updatedGame: Game = {
                date: 'date2',
                period: '1h00',
                player1: 'hahaa',
                scorePlayer1: 10,
                player2: 'hoooo',
                scorePlayer2: 60,
                gameType: 'classique',
                surrender: '',
            };
            const result = await gamesHistoryService.updateGame(game2.date, updatedGame);
            const games = await gamesHistoryService.collection.find({}, { projection: { _id: 0 } }).toArray();
            expect(result.modifiedCount).to.equal(1);
            expect(games[0].date).to.equal(game2.date);
            expect(games[0].gameType).to.equal(game2.gameType);
        });
    });
    describe('Error handling', async () => {
        it('should throw an error if we try to get all bots on a closed connection', async () => {
            await client.close();
            expect(gamesHistoryService.getGamesHistory()).to.eventually.be.rejectedWith(Error);
        });
    });
});
