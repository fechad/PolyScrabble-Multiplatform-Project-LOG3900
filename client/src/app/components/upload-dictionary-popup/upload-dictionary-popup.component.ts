import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DEFAULT_JSON_TYPE,
    DUPLICATED_DICTIONARY,
    FILE_QUANTITY_ERROR,
    FILE_TOO_BIG,
    INVALID_FILE_TYPE_ERROR,
    INVALID_FORMAT_ERROR,
    JSON_PARSING_ERROR,
    MAX_FILE_LENGTH,
    NO_FILE_ERROR,
} from '@app/constants/dictionary-constant';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryValidatorService } from '@app/services/dictionary-validator.service';
import { HttpService } from '@app/services/http.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-upload-dictionary-popup',
    templateUrl: './upload-dictionary-popup.component.html',
    styleUrls: ['./upload-dictionary-popup.component.scss'],
})
export class UploadDictionaryPopupComponent {
    fileToUpload: File | null;
    errorMessage: string;
    isProcessing: boolean;
    constructor(
        @Inject(MAT_DIALOG_DATA) private dictionaries: Dictionary[],
        private httpService: HttpService,
        private dictionaryValidator: DictionaryValidatorService,
        private dialogRef: MatDialogRef<UploadDictionaryPopupComponent>,
    ) {
        this.fileToUpload = null;
        this.errorMessage = '';
        this.isProcessing = false;
    }

    onFileSelected(files: FileList) {
        if (!files.length) return;
        this.resetErrorMessage();
        this.resetFile();
        this.updateErrorMessage(files);
        this.fileToUpload = files.item(0);
    }
    getFilename(): string | undefined {
        if (!this.fileToUpload) return undefined;
        return this.fileToUpload.name;
    }

    isTypeOfFileToUploadValid(): boolean {
        return this.fileToUpload !== null && this.isFileTypeValid(this.fileToUpload);
    }
    async uploadDictionary() {
        this.resetErrorMessage();
        if (this.fileToUpload === null) return;
        this.displayProcessing();
        const dictionary: Dictionary = await this.getUploadedFileData();
        if (!this.isParsingSuccessful()) {
            return this.handleParsingError();
        }
        if (this.isFileTooBig()) return this.handleFileTooBig();
        if (!this.dictionaryValidator.isDictionaryValid(dictionary)) {
            return this.handleInvalidDictionary();
        }
        this.removeAccentsFromDictionaryWords(dictionary);
        await lastValueFrom(this.httpService.addDictionary(dictionary));
        if (this.httpService.anErrorOccurred()) {
            return this.handleHttpUploadError(dictionary);
        }
        this.dialogRef.close(true);
    }
    private isParsingSuccessful(): boolean {
        return this.errorMessage !== JSON_PARSING_ERROR;
    }
    private isFileTooBig(): boolean {
        if (!this.fileToUpload) return true;
        return this.fileToUpload.size > MAX_FILE_LENGTH;
    }
    private handleFileTooBig() {
        this.hideProcessing();
        this.errorMessage = FILE_TOO_BIG;
    }
    private handleParsingError() {
        this.hideProcessing();
        return;
    }
    private handleInvalidDictionary() {
        this.hideProcessing();
        this.errorMessage = this.dictionaryValidator.errorMessage.length ? this.dictionaryValidator.errorMessage : INVALID_FORMAT_ERROR;
        return;
    }
    private handleHttpUploadError(dictionary: Dictionary) {
        this.hideProcessing();
        if (this.isDictionaryDuplicated(dictionary)) {
            this.errorMessage = this.getDuplicateMessage(dictionary);
            return;
        }
        this.errorMessage = this.httpService.getErrorMessage();
        return;
    }

    private isDictionaryDuplicated(dictionary: Dictionary): boolean {
        return this.dictionaries.find((existingDictionary) => existingDictionary.title === dictionary.title) !== undefined;
    }

    // https://qawithexperts.com/article/javascript/read-json-file-with-javascript/380
    private async getUploadedFileData() {
        return new Promise<Dictionary>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target === null) {
                    resolve({} as Dictionary);
                    return;
                }
                try {
                    const dictionary: Dictionary = JSON.parse(event.target.result as string);
                    resolve(dictionary);
                } catch (error) {
                    this.errorMessage = JSON_PARSING_ERROR;
                    resolve({} as Dictionary);
                    return;
                }
            };
            reader.readAsText(this.fileToUpload as Blob);
        });
    }
    private displayProcessing() {
        this.isProcessing = true;
    }
    private hideProcessing() {
        this.isProcessing = false;
    }
    private getDuplicateMessage(dictionary: Dictionary): string {
        if (!dictionary.title) return '';
        return `${DUPLICATED_DICTIONARY} "${dictionary.title}"`;
    }

    private removeAccentsFromDictionaryWords(dictionary: Dictionary) {
        if (!dictionary.words) return;
        const normalizedWords: string[] = [];
        for (const word of dictionary.words) {
            const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            normalizedWords.push(normalizedWord.toLowerCase());
        }
        dictionary.words = normalizedWords;
    }

    private updateErrorMessage(files: FileList | null) {
        if (files === null || files.length === 0) {
            this.errorMessage = NO_FILE_ERROR;
            return;
        }
        if (files.length > 1) {
            this.errorMessage = FILE_QUANTITY_ERROR;
            return;
        }
        if (!this.isFileTypeValid(files.item(0) as File)) {
            this.errorMessage = INVALID_FILE_TYPE_ERROR;
            return;
        }
        this.resetErrorMessage();
    }
    private resetErrorMessage() {
        this.errorMessage = '';
    }

    private resetFile() {
        this.fileToUpload = null;
    }

    private isFileTypeValid(file: File): boolean {
        return file.type === DEFAULT_JSON_TYPE;
    }
}
