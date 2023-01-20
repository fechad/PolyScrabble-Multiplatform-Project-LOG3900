import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { Dictionary } from '@app/interfaces/dictionary';
import { Collection, DeleteResult, UpdateResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

const DATABASE_COLLECTION = 'dictionaries';
@Service()
export class DictionariesService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<Dictionary> {
        return this.databaseService.database.collection(DATABASE_COLLECTION);
    }

    async getAllDictionaries(): Promise<Dictionary[]> {
        return this.collection
            .find({}, { projection: { _id: 0, file: 0 } })
            .toArray()
            .then((dictionaries: Dictionary[]) => {
                return dictionaries;
            });
    }

    async deleteAllDictionariesExceptDefault(): Promise<DeleteResult> {
        return this.collection.deleteMany({ title: { $ne: DEFAULT_DICTIONARY_TITLE } });
    }

    async getDictionary(title: string): Promise<Dictionary | null> {
        return this.collection.findOne({ title: `${title}` }, { projection: { _id: 0 } });
    }
    async deleteDictionary(titleToUpdate: string) {
        return await this.collection.findOneAndDelete({ title: titleToUpdate }).then((result) => {
            return result;
        });
    }

    async updateDictionary(titleToUpdate: string, updatedDictionary: Dictionary): Promise<UpdateResult> {
        const filter = { title: titleToUpdate };
        const setQuery = { $set: { title: updatedDictionary.title, description: updatedDictionary.description } };
        return this.collection.updateOne(filter, setQuery);
    }

    async addDictionary(dictionary: Dictionary): Promise<UpdateResult> {
        return this.collection.updateOne(
            { title: dictionary.title },
            { $setOnInsert: { title: dictionary.title, description: dictionary.description } },
            { upsert: true },
        );
    }
}
