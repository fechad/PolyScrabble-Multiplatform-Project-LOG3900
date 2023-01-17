import { Dictionary } from '@app/classes/dictionary';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { Collection, FindAndModifyWriteOpResultObject, UpdateWriteOpResult, WriteOpResult } from 'mongodb';
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

    async deleteAllDictionariesExceptDefault(): Promise<WriteOpResult> {
        return this.collection.remove({ title: { $ne: DEFAULT_DICTIONARY_TITLE } });
    }

    async getDictionary(title: string): Promise<Dictionary | null> {
        return this.collection.findOne({ title: `${title}` }, { projection: { _id: 0 } });
    }
    async deleteDictionary(titleToUpdate: string): Promise<FindAndModifyWriteOpResultObject<Dictionary>> {
        return await this.collection.findOneAndDelete({ title: titleToUpdate }).then((result) => {
            return result;
        });
    }

    async updateDictionary(titleToUpdate: string, updatedDictionary: Dictionary): Promise<UpdateWriteOpResult> {
        const filter = { title: titleToUpdate };
        const setQuery = { $set: { title: updatedDictionary.title, description: updatedDictionary.description } };
        return this.collection.updateOne(filter, setQuery);
    }

    async addDictionary(dictionary: Dictionary): Promise<UpdateWriteOpResult> {
        return this.collection.updateOne(
            { title: dictionary.title },
            { $setOnInsert: { title: dictionary.title, description: dictionary.description } },
            { upsert: true },
        );
    }
}
