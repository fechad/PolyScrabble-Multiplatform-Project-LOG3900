import { Bot } from '@app/interfaces/bot';
import { Collection, FindAndModifyWriteOpResultObject, UpdateWriteOpResult, WriteOpResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'bots';
@Service()
export class BotsService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Bot> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async getAllBots(): Promise<Bot[]> {
        return this.collection
            .find({})
            .toArray()
            .then((bots: Bot[]) => {
                return bots;
            });
    }

    async deleteBot(nameToDelete: string): Promise<FindAndModifyWriteOpResultObject<Bot>> {
        return await this.collection.findOneAndDelete({ name: nameToDelete }).then((result) => {
            return result;
        });
    }
    async deleteAllBots(): Promise<WriteOpResult> {
        const returned = this.collection.remove({});
        await this.collection.insertMany([
            { name: 'Trump', gameType: 'débutant' },
            { name: 'Zemmour', gameType: 'débutant' },
            { name: 'Legault', gameType: 'débutant' },
            { name: 'Ulrich', gameType: 'expert' },
            { name: 'Sami', gameType: 'expert' },
            { name: 'Augustin', gameType: 'expert' },
        ]);
        return returned;
    }

    async updateBot(nameToUpdate: string, updatedBot: Bot): Promise<UpdateWriteOpResult> {
        const filter = { name: nameToUpdate };
        const setQuery = { $set: { name: updatedBot.name, gameType: updatedBot.gameType } };
        return this.collection.updateOne(filter, setQuery, { upsert: true });
    }
}
