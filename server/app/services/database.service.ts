import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { app } from '@app/firebase-config';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Score } from '@app/interfaces/score';
import { DocumentData, Firestore, getFirestore, WriteResult } from 'firebase-admin/firestore';

import 'reflect-metadata';
import { Service } from 'typedi';

const DEFAULT_MAX_BATCH_SIZE = 100;
export const DATABASE_NAME = 'Cluster0';
export const DATABASE_COLLECTION = 'scores';

@Service()
export class DatabaseService {
    private db: Firestore;

    get database(): Firestore {
        return this.db;
    }

    async start(): Promise<Firestore | null> {
        try {
            this.db = getFirestore(app);
            // TODO: remove legacy function
            this.addDummyScores();
            this.addDummyAccounts();
        } catch {
            throw new Error('Database connection error');
        }
        return this.db;
    }

    // TODO: Rewrite that for loop to not have an unoptimal if statement
    async batchSave(collection: string, entries: object[], idComputer?: (entry: object) => string): Promise<WriteResult[]> {
        const batch = this.db.batch();
        for (const entry of entries) {
            if (idComputer) {
                const ref = this.db.collection(collection).doc(idComputer(entry));
                batch.set(ref, entry);
            } else {
                const ref = this.db.collection(collection).doc();
                batch.set(ref, entry);
            }
        }
        return batch.commit();
    }
    async addDummyAccounts(): Promise<WriteResult[]> {
        const usernames: string[] = ['Homer en mer', 'Aymen amen', 'Frankkk drankkk', 'Fedwin for the win', 'Etienne à Vienne', 'Anna kin'];
        const accounts: Account[] = [];
        for (const name of usernames) {
            const account: Account = {
                username: name,
                email: `${name}@polyscrabble.ca`,
                defaultLanguage: 'french',
                badges: ['dev'],
                defaultTheme: 'dark',
                highscore: 666,
                totalXP: 9999,
            };
            accounts.push(account);
        }

        return this.batchSave('accounts', accounts, (entry: Account) => entry.email);
    }
    // TODO: remove legacy function
    // Legacy function. Keeping it as an example for people who will work on db. Will delete at some point.
    async addDummyScores(): Promise<WriteResult[]> {
        const currentDate = new Date().toISOString();
        const usernames: string[] = ['Homer en mer', 'Aymen amen', 'Frankkk drankkk', 'Fedwin for the win', 'Etienne à Vienne', 'Anna kin'];
        const gameTypes = ['classic'];
        const scores: Score[] = [];
        for (const gameMode of gameTypes) {
            for (const username of usernames) {
                const score = {
                    points: 666,
                    gameType: gameMode,
                    author: username,
                    dictionary: DEFAULT_DICTIONARY_TITLE,
                    date: currentDate,
                };
                scores.push(score);
            }
        }
        return this.batchSave(DATABASE_COLLECTION, scores, (entry: Score) => entry.author);
    }

    async getDocumentByID<T>(collection: string, id: string): Promise<T> {
        const data = (await this.db.collection(collection).doc(id).get()).data();
        return data as T;
    }
    async getAllDocumentsFromCollection<T>(collection: string): Promise<T[]> {
        const entries: T[] = [];
        return await this.db
            .collection(collection)
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    entries.push(doc.data() as T);
                });
                return entries;
            });
    }

    formUpdatesArray(newData: object): { [field: string]: unknown }[] {
        return Object.entries(newData).map(([key, value]) => ({ key, value }));
    }
    async updateDocumentByID(collection: string, id: string, newData: object): Promise<WriteResult> {
        const documentRef = this.db.collection(collection).doc(id);
        return documentRef.update(newData);
    }

    async deleteDocumentByID(collection: string, id: string): Promise<WriteResult> {
        return this.db.collection(collection).doc(id).delete();
    }
    async deleteDocumentByField(collection: string, field: string, value: unknown): Promise<Promise<WriteResult>[]> {
        const collectionRef = this.db.collection(collection);

        const deleted: Promise<WriteResult>[] = [];
        await collectionRef
            .where(field, '==', value)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    deleted.push(doc.ref.delete());
                });
            });

        return deleted;
    }

    // All the code underneath is from: https://firebase.google.com/docs/firestore/manage-data/delete-data
    async deleteCollection(collectionPath: string, batchSize: number = DEFAULT_MAX_BATCH_SIZE) {
        const collectionRef = this.db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return new Promise((resolve, reject) => {
            this.deleteQueryBatch(query, resolve).catch(reject);
        });
    }

    // Disabling lint for query and resolve
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async deleteQueryBatch(query: any, resolve: any) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = this.db.batch();
        snapshot.docs.forEach((doc: DocumentData) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            this.deleteQueryBatch(query, resolve);
        });
    }
}
