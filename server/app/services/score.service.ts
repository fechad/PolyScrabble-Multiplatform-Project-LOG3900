import { Score } from '@app/interfaces/score';
import { WriteResult } from 'firebase-admin/firestore';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'scores';
const NO_LIMIT = 0;
@Service()
export class ScoresService {
    constructor(private databaseService: DatabaseService) {}

    async reinitializeScores() {
        this.databaseService.deleteCollection(DATABASE_COLLECTION);
        await this.databaseService.addDummyScores();
    }

    async getAllScores(): Promise<Score[]> {
        return this.databaseService.getAllDocumentsFromCollection<Score>(DATABASE_COLLECTION);
    }

    async getBestScoresByGameType(gameType: string, quantity?: number): Promise<unknown> {
        if (quantity !== undefined && quantity <= 0) {
            return new Promise<Score[]>((resolve) => {
                resolve([]);
            });
        }
        const size = quantity === undefined ? NO_LIMIT : quantity;
        return this.databaseService.database
            .collection(DATABASE_COLLECTION)
            .where('gameType', '==', gameType)
            .orderBy('points', 'desc')
            .orderBy('points', 'desc')
            .limit(size)
            .get();
    }
    // TODO: Rework this function with a better DB design
    async updateBestScore(score: Score): Promise<WriteResult> {
        return this.databaseService.updateDocumentByID(DATABASE_COLLECTION, score.author, score);
    }
}
