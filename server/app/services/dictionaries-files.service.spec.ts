/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { Dictionary } from '@app/classes/dictionary';
import { WordCollection } from '@app/classes/virtual-placement-logic/word-collection';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { glob } from 'glob';
import { describe } from 'mocha';
import * as mock from 'mock-fs';
import * as sinon from 'sinon';
import { DictionariesFileService } from './dictionaries-files.service';
chai.use(chaiAsPromised);

describe('DictionariesService', () => {
    let service: DictionariesFileService;
    let dictionary: Dictionary;
    let nonExistentTitle: string;
    let existentTitle: string;
    let updatedTitle: string;
    let fakeBaseWords: Map<number, WordCollection>;
    beforeEach(async () => {
        service = new DictionariesFileService();
        dictionary = { title: 'anglais', description: 'langue de Shakespeare', words: ['hey'] };
        nonExistentTitle = 'bottles';
        existentTitle = 'hola';
        updatedTitle = 'anglais';
        fakeBaseWords = new Map<number, WordCollection>();
        mock({
            'mocked/': {
                'hola.json': 'file content here',
                'dict.json': '{"words":["yo","testing"],"bases":{}}',
                'wordless-dictionary.json': '{"bases":{}}',
            },
        });
        service['dictionariesDirectory'] = 'mocked';
    });

    afterEach(async () => {
        mock.restore();
        sinon.restore();
    });
    describe('renameDictionaryFile tests', () => {
        it('should rename the file when it exists', async () => {
            service.renameDictionaryFile(existentTitle, updatedTitle);
            const files = glob.sync(`${process.cwd()}/mocked/*.json`);
            expect(files.length).to.be.equal(3);
            expect(files[0].includes('/mocked/anglais.json')).to.equal(true);
        });
        it('should not try to rename a file that does not exist', async () => {
            const stub = sinon.stub(fs, 'renameSync');
            service.renameDictionaryFile(nonExistentTitle, updatedTitle);
            expect(stub.called).to.equal(false);
        });
        it('should not try to rename a file when the old title is the same as the new one', async () => {
            const stub = sinon.stub(fs, 'renameSync');
            service.renameDictionaryFile(existentTitle, existentTitle);
            expect(stub.called).to.equal(false);
        });
        it('should try to rename a file when it exists', async () => {
            const stub = sinon.stub(fs, 'renameSync');
            service.renameDictionaryFile(existentTitle, updatedTitle);
            expect(stub.called).to.equal(true);
        });
        it('should not modify the content of the file when the rename is successful', async () => {
            service.renameDictionaryFile(existentTitle, updatedTitle);
            const file = service['getFilePath'](dictionary.title);
            const result = fs.readFileSync(file, 'utf8');
            expect(await fs.existsSync(file)).to.equal(true);
            expect(result).to.equal('file content here');
        });
    });
    describe('deleteDictionary', () => {
        it('should not try to delete a file that does not exist', async () => {
            sinon.stub(fs, 'existsSync').returns(false);
            const stub = sinon.stub(fs, 'unlinkSync');
            await service.deleteDictionary(nonExistentTitle);
            expect(stub.called).to.equal(false);
        });

        it('should try to delete a file when it exists', async () => {
            sinon.stub(fs, 'existsSync').returns(true);
            const stub = sinon.stub(fs, 'unlinkSync');
            await service.deleteDictionary(existentTitle);
            expect(stub.called).to.equal(true);
        });
        it('should delete a file when it exists', async () => {
            sinon.stub(fs, 'existsSync').returns(true);
            const filesBeforeDeletion = glob.sync(`${process.cwd()}/mocked/*.json`);
            await service.deleteDictionary(existentTitle);
            const filesAfterDeletion = glob.sync(`${process.cwd()}/mocked/*.json`);
            expect(filesAfterDeletion.length).to.equal(filesBeforeDeletion.length - 1);
        });
    });
    describe('createDictionaryFile tests', () => {
        it('should not attempt to create a file when it already exists', async () => {
            sinon.stub(fs, 'existsSync').returns(true);
            const stub = sinon.stub(fs, 'writeFileSync');
            await service.createDictionaryFile(dictionary, fakeBaseWords);
            expect(stub.called).to.equal(false);
        });
        it('the file created should contain only the words of the dictionary and the base dictionary', async () => {
            await service.createDictionaryFile(dictionary, fakeBaseWords);
            const file = service['getFilePath'](dictionary.title);
            const result = fs.readFileSync(file, 'utf8');
            expect(await fs.existsSync(file)).to.equal(true);
            expect(result).to.equal('{"words":["hey"],"bases":[]}');
        });
    });
    describe('getDictionaryWords tests', () => {
        it('should return the right words when the file exists', async () => {
            const words = await service.getDictionaryWords('dict');
            expect(words).to.deep.equal(['yo', 'testing']);
        });
        it('should return undefined when the file does not exist', async () => {
            const words = await service.getDictionaryWords('dictioanryThatDoesNotExist');
            expect(words).to.deep.equal(undefined);
        });
        it('should return undefined when the file exists but cannot be parsed', async () => {
            sinon.stub(JSON, 'parse').callsFake(() => {
                throw new Error();
            });
            const words = await service.getDictionaryWords('dict');
            expect(words).to.deep.equal(undefined);
        });

        it('should return undefined when the file exists and can be parsed but does not have the words key', async () => {
            sinon.stub(service, 'convertTitleIntoFilename' as any).returns('wordless-dictionary.json');
            const words = await service.getDictionaryWords('wordless-dictionary');
            expect(words).to.deep.equal(undefined);
        });
    });
    describe('deleteAllDictionariesExceptDefault', () => {
        let fakeDictionaryList: Dictionary[];
        beforeEach(async () => {
            fakeDictionaryList = [
                { title: DEFAULT_DICTIONARY_TITLE, description: '...' },
                { title: '...', description: '...' },
            ];
        });
        it('should call as many time as there is dictionaries without the default title the method deleteDictionary', async () => {
            const stub = sinon.stub(service, 'deleteDictionary');
            await service.deleteAllDictionariesExceptDefault(fakeDictionaryList);
            expect(stub.called).to.equal(true);
            expect(stub.callCount).to.equal(1);
        });
        it('should not call deleteDictionary with the default dictionary', async () => {
            const stub = sinon.stub(service, 'deleteDictionary');
            await service.deleteAllDictionariesExceptDefault(fakeDictionaryList);
            expect(stub.called).to.equal(true);
            expect(stub.calledWith(DEFAULT_DICTIONARY_TITLE)).to.equal(false);
        });
    });
    describe('convertTitleIntoFilename', () => {
        it('should convert a title of white spaces into "-"', () => {
            const filename = service.convertTitleIntoFilename('  ');
            expect(filename).to.equal('--.json');
        });
        it('should convert a title of apostrophes spaces into "_"', () => {
            const filename = service.convertTitleIntoFilename("''");
            expect(filename).to.equal('__.json');
        });
        it('should convert the apostrophes with "_" and the whitespace with "-"', () => {
            expect(service.convertTitleIntoFilename("l'affaire d'une vie")).to.equal('l_affaire-d_une-vie.json');
        });
        it('should convert a letter with an accent with the version of the letter without the accent', () => {
            const filename = service.convertTitleIntoFilename("C'est bientôt l'été");
            expect(filename).to.equal('c_est-bientot-l_ete.json');
        });
        it('should handle a title without apostrophes and whitespaces', () => {
            const filename = service.convertTitleIntoFilename('unTitreSympa');
            expect(filename).to.equal('untitresympa.json');
        });
        it('should handle a title composed of only letters with accents', () => {
            const filename = service.convertTitleIntoFilename('àâçéêèëîìïôòûù');
            expect(filename).to.equal('aaceeeeiiioouu.json');
        });
        it('should handle a title that has a bunch of random special char', () => {
            const filename = service.convertTitleIntoFilename('@!#*');
            expect(filename).to.equal('----.json');
        });
    });
});
