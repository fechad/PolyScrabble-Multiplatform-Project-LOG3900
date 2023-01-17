import { Game } from '@app/interfaces/game';
import { Collection, UpdateWriteOpResult, WriteOpResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'games';
@Service()
export class GamesHistoryService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Game> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async getGamesHistory(): Promise<Game[]> {
        return this.collection
            .find({})
            .toArray()
            .then((games: Game[]) => {
                return games;
            });
    }
    async deleteGames(): Promise<WriteOpResult> {
        return this.collection.remove({});
    }
    async updateGame(dateToUpdate: string, updatedGame: Game): Promise<UpdateWriteOpResult> {
        const filter = { date: dateToUpdate };
        const setQuery = {
            $set: {
                date: updatedGame.date,
                period: updatedGame.period,
                player1: updatedGame.player1,
                scorePlayer1: updatedGame.scorePlayer1,
                player2: updatedGame.player2,
                scorePlayer2: updatedGame.scorePlayer2,
                gameType: updatedGame.gameType,
                surrender: updatedGame.surrender,
            },
        };
        return this.collection.updateOne(filter, setQuery, { upsert: true });
    }
}
