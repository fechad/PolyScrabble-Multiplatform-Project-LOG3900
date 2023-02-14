import { Bot } from '@app/interfaces/firestoreDB/bot';
import { WriteResult } from 'firebase-admin/firestore';
import 'reflect-metadata';
import { Service } from 'typedi';
import { BOT_COLLECTION, DatabaseService } from './database.service';
@Service()
export class BotsService {
    constructor(private databaseService: DatabaseService) {}

    async getAllBots(): Promise<Bot[]> {
        return this.databaseService.getAllDocumentsFromCollection<Bot>(BOT_COLLECTION);
    }

    async deleteBot(nameToDelete: string) {
        return this.databaseService.deleteDocumentByField(BOT_COLLECTION, 'name', nameToDelete);
    }
    async resetAllBots(): Promise<unknown> {
        const returned = this.databaseService.deleteCollection(BOT_COLLECTION);
        await this.databaseService.addDummyBots();
        return returned;
    }

    async updateBot(nameToUpdate: string, updatedBot: Bot): Promise<WriteResult> {
        return this.databaseService.updateDocumentByID(BOT_COLLECTION, nameToUpdate, updatedBot);
    }
}
