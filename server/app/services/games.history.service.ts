import { Game } from '@app/interfaces/firestoreDB/game';
import { WriteResult } from 'firebase-admin/firestore';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'games';
@Service()
export class GamesHistoryService {
    constructor(private databaseService: DatabaseService) {}

    async getGamesHistory(): Promise<Game[]> {
        return this.databaseService.getAllDocumentsFromCollection<Game>(DATABASE_COLLECTION);
    }
    async deleteGames(): Promise<unknown> {
        return this.databaseService.deleteCollection(DATABASE_COLLECTION);
    }
    async updateGame(dateToUpdate: string, updatedGame: Game): Promise<WriteResult> {
        return this.databaseService.updateDocumentByID(DATABASE_COLLECTION, updatedGame.startDatetime, updatedGame);
    }
}
