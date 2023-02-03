import { Dictionary } from '@app/interfaces/dictionary';
import { WriteResult } from 'firebase-admin/firestore';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'dictionaries';
@Service()
export class DictionariesService {
    constructor(private databaseService: DatabaseService) {}

    async getAllDictionaries(): Promise<Dictionary[]> {
        return this.databaseService.getAllDocumentsFromCollection<Dictionary>(DATABASE_COLLECTION);
    }

    // TODO: Rewrite this function to not delete the base dictionary
    async deleteAllDictionariesExceptDefault() {
        return this.databaseService.deleteCollection(DATABASE_COLLECTION);
    }

    async getDictionary(title: string): Promise<Dictionary | null> {
        const doc = await this.databaseService.database.doc(title).get();
        return doc.data as unknown as Dictionary;
    }
    async deleteDictionary(titleToUpdate: string) {
        return await this.databaseService.deleteDocumentByField(DATABASE_COLLECTION, 'title', titleToUpdate);
    }

    async updateDictionary(titleToUpdate: string, updatedDictionary: Dictionary): Promise<WriteResult> {
        return this.databaseService.updateDocumentByID(DATABASE_COLLECTION, titleToUpdate, updatedDictionary);
    }

    async addDictionary(dictionary: Dictionary): Promise<WriteResult> {
        return await this.databaseService.database.collection(DATABASE_COLLECTION).doc(dictionary.title).set(dictionary);
    }
}
