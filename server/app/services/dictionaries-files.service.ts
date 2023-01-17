import { Dictionary } from '@app/classes/dictionary';
import { WordCollection } from '@app/classes/virtual-placement-logic/word-collection';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import * as fs from 'fs';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export class DictionariesFileService {
    private dictionariesDirectory: string;
    constructor() {
        this.dictionariesDirectory = 'assets';
    }
    convertTitleIntoFilename(title: string): string {
        if (title.includes('.json')) return title;
        const normalizedTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return `${normalizedTitle
            .replace(/'/g, '_')
            .replace(/[^a-z0-9_]/gi, '-')
            .toLowerCase()}.json`;
    }
    deleteDictionary(titleToRemove: string) {
        const file = this.getFilePath(titleToRemove);
        if (!fs.existsSync(file)) return;
        fs.unlinkSync(file);
    }
    deleteAllDictionariesExceptDefault(dictionaries: Dictionary[]) {
        for (const dictionary of dictionaries) {
            if (dictionary.title === DEFAULT_DICTIONARY_TITLE) continue;
            this.deleteDictionary(dictionary.title);
        }
    }
    async createDictionaryFile(dictionary: Dictionary, baseWords: Map<number, WordCollection>) {
        const file = this.getFilePath(dictionary.title);
        if (fs.existsSync(file)) return;
        const data = JSON.stringify({ words: dictionary.words, bases: [...baseWords] });
        fs.writeFileSync(file, data);
    }
    async renameDictionaryFile(oldTitle: string, newTitle: string) {
        if (oldTitle === newTitle) return;
        const oldFile = this.getFilePath(oldTitle);
        if (!fs.existsSync(oldFile)) return;
        const newFile = this.getFilePath(newTitle);
        fs.renameSync(oldFile, newFile);
    }

    async getDictionaryWords(title: string): Promise<string[] | undefined> {
        return new Promise<string[] | undefined>((resolve) => {
            const file = this.getFilePath(title);
            if (!fs.existsSync(file)) return resolve(undefined);
            fs.readFile(file, (err, data) => {
                if (err) resolve(undefined);
                try {
                    const jsonObject = JSON.parse(data.toString());
                    if (!jsonObject.words) resolve(undefined);
                    resolve(jsonObject.words);
                } catch (error) {
                    resolve(undefined);
                }
            });
        });
    }
    private getFilePath(title: string): string {
        return join(__dirname, `../../${this.dictionariesDirectory}/${this.convertTitleIntoFilename(title)}`);
    }
}
