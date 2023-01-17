// Some methods/attributes are private and I needed to access them to test them
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { UploadDictionaryPopupComponent } from './upload-dictionary-popup.component';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpService } from '@app/http.service';
import { of } from 'rxjs';
import {
    FILE_QUANTITY_ERROR,
    FILE_TOO_BIG,
    INVALID_FILE_TYPE_ERROR,
    INVALID_FORMAT_ERROR,
    JSON_PARSING_ERROR,
    NO_FILE_ERROR,
} from '@app/constants/dictionary-constant';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryValidatorService } from '@app/services/dictionary-validator.service';

describe('UploadDictionaryPopupComponent', () => {
    let component: UploadDictionaryPopupComponent;
    let fixture: ComponentFixture<UploadDictionaryPopupComponent>;
    let httpService: HttpService;
    let dictionaryValidator: DictionaryValidatorService;
    let dialogReference: MatDialogRef<UploadDictionaryPopupComponent>;
    let emptyDictionary: Dictionary;
    let validDictionary: Dictionary;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [UploadDictionaryPopupComponent],
            providers: [{ provide: HttpService }, { provide: MatDialogRef, useClass: MatDialogRefMock }, { provide: MAT_DIALOG_DATA, useValue: [] }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadDictionaryPopupComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dictionaryValidator = fixture.debugElement.injector.get(DictionaryValidatorService);
        dialogReference = fixture.debugElement.injector.get(MatDialogRef);
        fixture.detectChanges();
        emptyDictionary = { title: '', description: '', words: [] };
        validDictionary = { title: 'NY slangs', description: 'street vocab', words: ['Deadass', 'Frontin'] };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('onFileSelected tests', () => {
        let jsonFileList: FileList;
        let nonJsonFileList: FileList;
        let manyFileList: FileList;
        let emptyFileList: FileList;
        let jsonFile: File;
        let nonJsonFile: File;
        beforeEach(() => {
            jsonFile = new Blob([''], { type: 'application/json' }) as File;
            nonJsonFile = new Blob([''], { type: 'text/html' }) as File;
            jsonFileList = { 0: jsonFile, length: 1, item: () => jsonFile };
            nonJsonFileList = { 0: nonJsonFile, length: 1, item: () => nonJsonFile };
            manyFileList = { 0: nonJsonFile, 1: jsonFile, length: 2, item: () => nonJsonFile };
            emptyFileList = { length: 0, item: () => null };
        });
        it('when selecting a valid file, the fileToUpload should no longer be null', () => {
            component.onFileSelected(jsonFileList);
            expect(component.fileToUpload).not.toBeNull();
            expect(component.fileToUpload).toEqual(jsonFile);
        });
        it('when selecting an invalid file, the fileToUpload should become the invalid file', () => {
            component.fileToUpload = jsonFile;
            component.onFileSelected(nonJsonFileList);
            expect(component.fileToUpload).toEqual(nonJsonFile);
        });
        it('when selecting a valid file, the error message should be cleared', () => {
            component.errorMessage = 'watch out !';
            component.onFileSelected(jsonFileList);
            expect(component.errorMessage).toEqual('');
        });
        it('when selecting a non json file the error message should be about the invalid file type', () => {
            component.onFileSelected(nonJsonFileList);
            expect(component.errorMessage).toEqual(INVALID_FILE_TYPE_ERROR);
            expect(component.fileToUpload).toEqual(nonJsonFile);
        });
        it('when selecting multiple files the error message should be about the the number of files chosen', () => {
            component.onFileSelected(manyFileList);
            expect(component.errorMessage).toEqual(FILE_QUANTITY_ERROR);
        });
        it('when not selecting files, the error message and the file to upload should remain the same ', () => {
            component.errorMessage = 'watch out !';
            component.fileToUpload = jsonFile;
            component.onFileSelected(emptyFileList);
            expect(component.errorMessage).toEqual('watch out !');
            expect(component.fileToUpload).toEqual(jsonFile);
        });
    });
    describe('getFilename() tests', () => {
        it('should return undefined when the filetoUpload is not defined', () => {
            component.fileToUpload = null;
            expect(component.getFilename()).toBeUndefined();
        });
        it('should return undefined when the filetoUpload is not defined', () => {
            const file = new File([], 'hey.json');
            component.fileToUpload = file;
            expect(component.getFilename()).toEqual('hey.json');
        });
    });

    describe('isTypeOfFileToUploadValid tests', () => {
        it('should return false when the fileToUpload is not defined', () => {
            component.fileToUpload = null;
            expect(component.isTypeOfFileToUploadValid()).toBeFalse();
        });
        it('should return false when the fileToUpload is not a json file', () => {
            component.fileToUpload = new Blob([''], { type: 'text/html' }) as File;
            expect(component.isTypeOfFileToUploadValid()).toBeFalse();
        });
        it('should return true when the fileToUpload is a json', () => {
            component.fileToUpload = new Blob([''], { type: 'application/json' }) as File;
            expect(component.isTypeOfFileToUploadValid()).toBeTrue();
        });
    });
    describe('uploadDictionary()', () => {
        it('should call isDictionaryValid with the data from the json file', async () => {
            component.fileToUpload = new File(['hello'], 'hey.json');
            const spy = spyOn(dictionaryValidator, 'isDictionaryValid');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(Promise.resolve(validDictionary));
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            await component.uploadDictionary();
            expect(spy).toHaveBeenCalledWith(validDictionary);
        });
        it('should call handleParsingError when the error message is JSON_PARSING_ERROR', async () => {
            component.fileToUpload = new File(['hello,,,.,.,,,'], 'hey.json');
            const spy = spyOn(component, 'handleParsingError' as any);
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            await component.uploadDictionary();
            expect(component.errorMessage).toEqual(JSON_PARSING_ERROR);
            expect(spy).toHaveBeenCalled();
        });
        it('should call addDictionary when the dictionary is valid', async () => {
            component.fileToUpload = new File([], 'hey.json');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(of(validDictionary));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(true);
            const spy = spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            await component.uploadDictionary();
            expect(spy).toHaveBeenCalled();
        });
        it('the error should be an invalid format when the data from the uploaded data is not a dictionary', async () => {
            component.fileToUpload = new File(['hello'], 'hey.json');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(Promise.resolve({} as Dictionary));
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(false);
            await component.uploadDictionary();
            expect(component.errorMessage).toEqual(INVALID_FORMAT_ERROR);
        });
        it('should display the error message from the validator when it has one.', async () => {
            component.fileToUpload = new File(['hello'], 'hey.json');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(Promise.resolve({} as Dictionary));
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(false);
            dictionaryValidator.errorMessage = 'error';
            await component.uploadDictionary();
            expect(component.errorMessage).toEqual('error');
        });
        it('should NOT call addDictionary when the dictionary is invalid', async () => {
            component.fileToUpload = new File([], 'hey.json');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(of(emptyDictionary));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(false);
            const spy = spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            await component.uploadDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should close the dialog with true when the upload was successful', async () => {
            component.fileToUpload = new File([], 'hey.json');
            const spy = spyOn(dialogReference, 'close');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(of(validDictionary));
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(true);
            await component.uploadDictionary();
            expect(spy).toHaveBeenCalledWith(true);
        });
        it('should NOT close the dialog when the uploaded dictionary was NOT in a valid format', async () => {
            component.fileToUpload = new File([], 'hey.json');
            const spy = spyOn(component['dialogRef'], 'close');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(of(emptyDictionary));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(false);
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            await component.uploadDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should NOT close the dialog when an error from the server occurred', async () => {
            component.fileToUpload = new File([], 'hey.json');
            const spy = spyOn(component['dialogRef'], 'close');
            spyOn(component, 'getUploadedFileData' as any).and.returnValue(of(validDictionary));
            spyOn(dictionaryValidator, 'isDictionaryValid').and.returnValue(true);
            spyOn(httpService, 'addDictionary').and.returnValue(of({} as HttpResponse<Dictionary>));
            httpService['errorMessage'] = 'error';
            await component.uploadDictionary();
            expect(spy).not.toHaveBeenCalled();
            expect(component.errorMessage).toEqual('error');
        });
        it('should not upload a file that is too big', async () => {
            component.fileToUpload = new File([], 'hey.json');
            spyOn(component, 'isParsingSuccessful' as any).and.returnValue(true);
            spyOn(component, 'isFileTooBig' as any).and.returnValue(true);
            await component.uploadDictionary();
            expect(component.errorMessage).toEqual(FILE_TOO_BIG);
        });
    });

    describe('getUploadedFileData tests', () => {
        it('should update the error message when parsing a json that contain errors in it', async () => {
            component.fileToUpload = new Blob(['{"title": "t",,}'], {
                type: 'application/json',
            }) as File;
            await component['getUploadedFileData']();
            expect(component.errorMessage).toEqual(JSON_PARSING_ERROR);
        });
        it('should not update the error message when the json file does not have errors in it', async () => {
            component.fileToUpload = new Blob(['["title"]'], {
                type: 'application/json',
            }) as File;
            await component['getUploadedFileData']();
            expect(component.errorMessage).toEqual('');
        });
        it('should create a dictionary with the title, description and words that were in the JSON', async () => {
            component.fileToUpload = new Blob(['{"title": "t","description": "a","words": ["yo", "testing"]}'], {
                type: 'application/json',
            }) as File;
            const dictionary: Dictionary = await component['getUploadedFileData']();
            expect(dictionary.title).toEqual('t');
            expect(dictionary.description).toEqual('a');
            expect(dictionary.words).toEqual(['yo', 'testing']);
        });
    });
    describe('removeAccentsFromDictionaryWords tests', () => {
        it('should remove the accents from the words that have it and lowercase all the words', () => {
            const wordsWithAccents = ['Français', 'olé', 'èé', 'Bébé', 'Eau', 'çéâêîôûàèìòùëïVü'];
            const dictionary: Dictionary = { title: '..', description: '.', words: wordsWithAccents };
            const normalizedWords = ['francais', 'ole', 'ee', 'bebe', 'eau', 'ceaeiouaeioueivu'];
            component['removeAccentsFromDictionaryWords'](dictionary);
            expect(dictionary.words).toEqual(normalizedWords);
        });
        it('should not change the words of a dictionary when they do not have accents', () => {
            const wordsWithoutAccents = ['give', 'me', 'pepsi'];
            const dictionary: Dictionary = { title: '..', description: '.', words: wordsWithoutAccents };
            component['removeAccentsFromDictionaryWords'](dictionary);
            expect(dictionary.words).toEqual(wordsWithoutAccents);
        });
    });
    describe('handleParsingError tests', () => {
        it('should hide the processing when it is active', () => {
            component.isProcessing = true;
            component['handleParsingError']();
            expect(component.isProcessing).toEqual(false);
        });
        it('should not display the processing when it is off', () => {
            component.isProcessing = false;
            component['handleParsingError']();
            expect(component.isProcessing).toEqual(false);
        });
    });
    describe('handleHttpUploadError tests', () => {
        it('should set the error message using the getDuplicateMessage when the dictionary is a duplicate', () => {
            spyOn(component, 'isDictionaryDuplicated' as any).and.returnValue(true);
            spyOn(component, 'getDuplicateMessage' as any).and.returnValue('error');
            component['handleHttpUploadError']({} as Dictionary);
            expect(component.errorMessage).toEqual('error');
        });
        it('should set the error message using the httpService error when the dictionary is NOT a duplicate', () => {
            spyOn(component, 'isDictionaryDuplicated' as any).and.returnValue(false);
            spyOn(component, 'getDuplicateMessage' as any).and.returnValue('error');
            spyOn(httpService, 'getErrorMessage').and.returnValue('HttpError');
            component['handleHttpUploadError']({} as Dictionary);
            expect(component.errorMessage).toEqual('HttpError');
        });
    });
    describe('getDuplicateMessage tests', () => {
        it('should return an empty string when the dictionary has an empty title', () => {
            const result = component['getDuplicateMessage']({ title: '' } as Dictionary);
            expect(result).toEqual('');
        });
        it('should return an error message the the title of the duplicated dictionary', () => {
            const result = component['getDuplicateMessage']({ title: 'yes' } as Dictionary);
            expect(result.includes('yes')).toBeTrue();
        });
    });
    describe('updateErrorMessage direct private tests', () => {
        it('should set the error message to NO_FILE_ERROR when being passed null', () => {
            component['updateErrorMessage'](null);
            expect(component.errorMessage).toEqual(NO_FILE_ERROR);
        });
    });
});
