import { Bot } from '@app/interfaces/bot';
import { WriteResult } from 'firebase-admin/firestore';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'bots';
@Service()
export class BotsService {
    constructor(private databaseService: DatabaseService) {}

    async getAllBots(): Promise<Bot[]> {
        return this.databaseService.getAllDocumentsFromCollection<Bot>(DATABASE_COLLECTION);
    }

    async deleteBot(nameToDelete: string) {
        return this.databaseService.deleteDocumentByField(DATABASE_COLLECTION, 'name', nameToDelete);
    }
    async resetAllBots(): Promise<unknown> {
        const returned = this.databaseService.deleteCollection(DATABASE_COLLECTION);
        await this.databaseService.batchSave(
            DATABASE_COLLECTION,
            [
                { name: 'Trump', gameType: 'débutant' },
                { name: 'Zemmour', gameType: 'débutant' },
                { name: 'Legault', gameType: 'débutant' },
                { name: 'LebronJames', gameType: 'expert' },
                { name: 'Hermes', gameType: 'expert' },
                { name: 'Jack Da ripa', gameType: 'expert' },
            ],
            (entry: { name: string; gameType: string }) => entry.name,
        );
        return returned;
    }

    async updateBot(nameToUpdate: string, updatedBot: Bot): Promise<WriteResult> {
        return this.databaseService.updateDocumentByID(DATABASE_COLLECTION, nameToUpdate, updatedBot);
    }
}
