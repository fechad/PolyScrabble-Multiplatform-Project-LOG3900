import { Score } from '@app/classes/score';
import { Collection, UpdateWriteOpResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'scores';
const NO_LIMIT = 0;
const DESCENDING_SORT = -1;
@Service()
export class ScoresService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Score> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async reinitializeScores() {
        this.collection.remove({});
        await this.databaseService.populateDB();
    }

    async getAllScores(): Promise<Score[]> {
        return this.collection
            .find({})
            .sort({ points: DESCENDING_SORT, date: DESCENDING_SORT })
            .toArray()
            .then((scores: Score[]) => {
                return scores;
            });
    }

    async getBestScoresByGameType(gameType: string, quantity?: number): Promise<Score[]> {
        if (quantity !== undefined && quantity <= 0) {
            return new Promise<Score[]>((resolve) => {
                resolve([]);
            });
        }
        const size = quantity === undefined ? NO_LIMIT : quantity;
        return this.collection
            .find({ gameType: { $in: [gameType] } })
            .sort({ points: DESCENDING_SORT, date: DESCENDING_SORT })
            .limit(size)
            .toArray()
            .then((scores: Score[]) => {
                return scores;
            });
    }
    async updateBestScore(score: Score): Promise<UpdateWriteOpResult> {
        return this.collection.updateOne(
            { author: score.author, gameType: score.gameType, points: score.points },
            { $set: { author: score.author, gameType: score.gameType, points: score.points, dictionary: score.dictionary, date: score.date } },
            { upsert: true },
        );
    }
}
