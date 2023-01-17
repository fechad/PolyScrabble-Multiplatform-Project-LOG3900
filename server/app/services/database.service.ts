import { Score } from '@app/classes/score';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

const DB_USERNAME = 'firstUser';
const DB_PASSWORD = 'a2MLZJUUH26ggA5y';
const DATABASE_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.llymw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
export const DATABASE_NAME = 'Cluster0';
export const DATABASE_COLLECTION = 'scores';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url, this.options);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        if ((await this.db.collection(DATABASE_COLLECTION).countDocuments()) === 0) {
            await this.populateDB();
        }
        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async populateDB(): Promise<void> {
        const currentDate = new Date().toISOString();
        const usernames: string[] = ['Hamza', 'Homer', 'Aymen', 'Ahmed', 'Fanilo'];
        const gameTypes = ['log2990', 'classic'];
        const scores: Score[] = [];
        for (const gameMode of gameTypes) {
            for (const username of usernames) {
                const score = {
                    points: 0,
                    gameType: gameMode,
                    author: username,
                    dictionary: DEFAULT_DICTIONARY_TITLE,
                    date: currentDate,
                };
                scores.push(score);
            }
        }
        await this.db.collection(DATABASE_COLLECTION).insertMany(scores);
    }

    get database(): Db {
        return this.db;
    }
}
