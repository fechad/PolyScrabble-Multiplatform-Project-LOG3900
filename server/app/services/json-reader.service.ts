import * as fs from 'fs';
import * as path from 'path';
import { Service } from 'typedi';

@Service()
export class JsonReader {
    getData(jsonName: string) {
        if (jsonName === undefined || jsonName === '') return;
        const rawData = fs.readFileSync(path.join(__dirname, '../../assets/', jsonName), 'utf-8');
        return JSON.parse(rawData);
    }
}
