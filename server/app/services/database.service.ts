import { EINSTEIN_BADGE, MOZART_BADGE, SANTA_BADGE, SERENA_BADGE, TRUMP_BADGE } from '@app/constants/bot-badges';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { DEFAULT_USER_SETTINGS } from '@app/constants/default-user-settings';
import { app } from '@app/firebase-config';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Log } from '@app/interfaces/firestoreDB/log';
import { Score } from '@app/interfaces/score';
import { DocumentData, Firestore, WriteResult, getFirestore } from 'firebase-admin/firestore';

import 'reflect-metadata';
import { Service } from 'typedi';

export const SCORE_COLLECTION = 'scores';
export const BOT_COLLECTION = 'bots';
export const USED_USERNAMES_COLLECTION = 'usedUsernames';
export const LOGS_COLLECTION = 'logs';
const DEFAULT_MAX_BATCH_SIZE = 100;
const ACCOUNTS_COLLECTION = 'accounts';
const USERNAME_USED_ERROR = 'chosen username already in use';

@Service()
export class DatabaseService {
    private db: Firestore;
    private connectedUser: Map<string, unknown>;

    constructor() {
        this.connectedUser = new Map();
    }

    get database(): Firestore {
        return this.db;
    }

    async start(): Promise<Firestore | null> {
        try {
            this.db = getFirestore(app);

            // Uncomment only in case of DB reset
            /*
            this.syncUsedUserNames();
            this.addDummyScores();
            this.addDummyAccounts();
            this.addDummyBots();*/
        } catch {
            throw new Error('Database connection error');
        }
        return this.db;
    }
    async log(docID: string, subCollectionId: string, log: Log) {
        this.db.collection(LOGS_COLLECTION).doc(docID).collection(subCollectionId).add(log);
    }

    isUserConnected(email: string): boolean {
        return this.connectedUser.has(email);
    }

    setUserAsConnected(connectionData: unknown) {
        if (!connectionData) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.connectedUser.set((connectionData as any).email.toLowerCase(), ''); // no data as value because not needed for the use case
    }

    setUserAsDisconnected(email: string) {
        this.connectedUser.delete(email);
    }

    // TODO: Delete once in prod. If we ever have issues with account usernames, it is because of this.
    async batchSave(collection: string, entries: object[], idComputer?: (entry: object) => string): Promise<WriteResult[]> {
        const batch = this.db.batch();
        for (const entry of entries) {
            if (collection === ACCOUNTS_COLLECTION && (await this.checkUsernameUsed((entry as Account).username))) continue;
            if (idComputer) {
                const computedRef = this.db.collection(collection).doc(idComputer(entry));
                batch.set(computedRef, entry);
                continue;
            }
            const ref = this.db.collection(collection).doc();
            batch.set(ref, entry);
        }
        return batch.commit();
    }
    async addAccount(account: Account) {
        if (await this.checkUsernameUsed(account.username)) throw new Error(USERNAME_USED_ERROR);
        this.db.collection(ACCOUNTS_COLLECTION).doc(account.email).set(account);
        this.db.collection(USED_USERNAMES_COLLECTION).doc(account.username).set({ email: account.email });
    }

    async addDummyBots(): Promise<WriteResult[]> {
        return await this.batchSave(
            BOT_COLLECTION,
            [
                { name: 'Trump', gameType: 'débutant', avatarURLs: { angry: 'https://pbs.twimg.com/media/CrzsyX9WYAAmCrA.jpg' } },
                { name: 'Zemmour', gameType: 'débutant' },
                { name: 'Legault', gameType: 'débutant' },
                { name: 'LebronJames', gameType: 'expert' },
                { name: 'Hermes', gameType: 'expert' },
                { name: 'Jack Da ripa', gameType: 'expert' },
            ],
            (entry: { name: string; gameType: string }) => entry.name,
        );
    }
    async addDummyAccounts(): Promise<WriteResult[]> {
        const usernames: string[] = [
            'hilomer',
            'manou',
            'frank',
            'fred',
            'tonio',
            'anna',
            'Simon',
            'Lucie',
            'Jojo',
            'Jack',
            'Niko',
            'Zeoui',
            'OuiOui',
            'Filoulou',
        ];
        // eslint-disable-next-line prefer-const
        let accounts: Account[] = [];
        for (const name of usernames) {
            let url = DEFAULT_USER_SETTINGS.avatarUrl;
            if (name === 'anna' || name === 'Simon' || name === 'Lucie' || name === 'Jojo') {
                url = 'https://cdn3.iconfinder.com/data/icons/chat-bot-glyph-silhouettes-1/300/14112417Untitled-3-512.png';
            }
            if (name === 'Jack' || name === 'Niko' || name === 'Zeoui' || name === 'OuiOui' || name === 'Filoulou') {
                url = 'https://static.botsrv2.com/backoffice/images/qb_logo/246ba2505dfa7ea81c50a61a23b741fa.png';
            }
            accounts.push({
                username: name,
                email: `${name}@polyscrabble.ca`,
                badges: [SANTA_BADGE, EINSTEIN_BADGE, TRUMP_BADGE, MOZART_BADGE, SERENA_BADGE],
                userSettings: {
                    defaultLanguage: 'french',
                    defaultTheme: 'light',
                    victoryMusic: 'WeAreTheChamps.mp3',
                    avatarUrl: url,
                },
                totalXP: 9999,
                highScores: {},
                bestGames: [],
                gamesPlayed: [],
                gamesWon: 0,
            });
        }
        return this.batchSave('accounts', accounts, (entry: Account) => entry.email);
    }
    // TODO: remove legacy function
    // Legacy function. Keeping it as an example for people who will work on db. Will delete at some point.
    async addDummyScores(): Promise<WriteResult[]> {
        const currentDate = new Date().toISOString();
        const usernames: string[] = ['homer', 'aymen', 'frank', 'fedwin', 'etienne', 'anna'];
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
        return this.batchSave(SCORE_COLLECTION, scores, (entry: Score) => entry.author);
    }

    async getDocumentByID<T>(collection: string, id: string): Promise<T | null> {
        const document = await this.db.collection(collection).doc(id).get();
        if (!document.exists) return null;

        const data = document.data();
        return data as T;
    }
    async getUserLogs(userID: string): Promise<Log[]> {
        const ref = this.db.collection('logs').doc('userActions').collection(userID);
        const snapshot = await ref.orderBy('time', 'desc').get();
        const data = snapshot.docs.map((doc) => doc.data() as Log);
        return data;
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
        try {
            const documentRef = this.db.collection(collection).doc(id);

            const documentSnapshot = await documentRef.get();
            if (!documentSnapshot.exists) return documentRef.set(newData);
            if (collection === ACCOUNTS_COLLECTION && (documentSnapshot.data() as Account).username !== (newData as Account).username) {
                await this.handleUsernameChangeRequest(documentSnapshot.data() as Account, newData as Account);
            }
            return documentRef.update(newData);
        } catch (error) {
            return Promise.reject(`Could not update or create document: ${collection}/${id}. Error: ${error}`);
        }
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

    async getDocumentByField(collection: string, field: string, value: unknown): Promise<Account | null> {
        const collectionRef = this.db.collection(collection);

        const querySnapshot = await collectionRef.where(field, '==', value).get();

        const firstDoc = querySnapshot.docs[0];
        if (!firstDoc) return null;
        return firstDoc.data() as Account;
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
    async syncUsedUserNames() {
        const usedUsernames = this.getAllDocumentsFromCollection(ACCOUNTS_COLLECTION);
        (await usedUsernames).forEach(async (entry: Account) =>
            this.db.collection(USED_USERNAMES_COLLECTION).doc(entry.username).set({ email: entry.email }),
        );
    }
    private async checkUsernameUsed(username: string) {
        const userNameEntry = await this.db.collection(USED_USERNAMES_COLLECTION).doc(username).get();
        return userNameEntry.exists;
    }
    private async handleUsernameChangeRequest(oldData: Account, newData: Account) {
        const userNameUsed = await this.checkUsernameUsed(newData.username);
        if (userNameUsed) throw new Error(USERNAME_USED_ERROR);
        this.db.collection(USED_USERNAMES_COLLECTION).doc(newData.username).set({ email: newData.email });
        this.deleteDocumentByID(USED_USERNAMES_COLLECTION, oldData.username);
    }
}
