import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { EditDictionaryPopupComponent } from '@app/components/edit-dictionary-popup/edit-dictionary-popup.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { UploadDictionaryPopupComponent } from '@app/components/upload-dictionary-popup/upload-dictionary-popup.component';
import {
    SUCCESSFUL_DELETE_ALL_MESSAGE,
    SUCCESSFUL_DELETE_MESSAGE,
    SUCCESSFUL_EDIT_MESSAGE,
    SUCCESSFUL_UPLOAD_MESSAGE,
} from '@app/constants/dictionary-constant';
import { Dictionary } from '@app/interfaces/dictionary';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { lastValueFrom } from 'rxjs';

export const DEFAULT_DICTIONARY_TITLE = 'dictionnaire par défaut';

@Component({
    selector: 'app-dictionaries-table',
    templateUrl: './dictionaries-table.component.html',
    styleUrls: ['./dictionaries-table.component.scss'],
})
export class DictionariesTableComponent implements AfterViewInit {
    @Input() dictionaries: Dictionary[];
    successMessage: string;
    constructor(private httpService: HttpService, private dialog: MatDialog) {
        this.dictionaries = [];
        this.successMessage = '';
    }

    async ngAfterViewInit() {
        await this.handleRefresh();
    }

    async handleRefresh() {
        const updatedDictionaries = await lastValueFrom(this.httpService.getAllDictionaries());
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            this.dictionaries = [];
            return;
        }
        this.dictionaries = updatedDictionaries;
    }

    validateDictionaryDeletionWithUser(dictionary: Dictionary) {
        const description: InformationalPopupData = {
            header: 'Voulez-vous effacer un dictionnaire ?',
            body: `Le dictionnaire "${dictionary.title}" sera effacé.\n\nCette action sera définitive.`,
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.deleteDictionary(dictionary.title);
        });
    }
    async deleteDictionary(title: string) {
        await lastValueFrom(this.httpService.deleteDictionary(title));
        await this.handleRefresh();
        if (this.httpService.anErrorOccurred()) {
            this.clearSuccessMessage();
            return;
        }
        this.successMessage = SUCCESSFUL_DELETE_MESSAGE;
    }

    canBeDeleted(title: string): boolean {
        return title !== DEFAULT_DICTIONARY_TITLE;
    }
    openDictionaryModificationPopup(dictionary: Dictionary) {
        const dialog = this.dialog.open(EditDictionaryPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: dictionary,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result || !this.isDictionaryUpdated(dictionary, result)) return;
            this.successMessage = SUCCESSFUL_EDIT_MESSAGE;
            await this.handleRefresh();
        });
    }

    async handleResetDictionaries() {
        const description: InformationalPopupData = {
            header: 'Voulez-vous vraiment réinitiliser cette table ?',
            body: `Tous les dictionnaires sauf le dictionnaire par défaut '${DEFAULT_DICTIONARY_TITLE}' seront effacés`,
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.deleteAllDictionaries();
        });
    }

    openUploadDictionaryPopup() {
        const dialog = this.dialog.open(UploadDictionaryPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.dictionaries,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            this.successMessage = SUCCESSFUL_UPLOAD_MESSAGE;
            await this.handleRefresh();
        });
    }
    clearSuccessMessage() {
        this.successMessage = '';
    }
    // https://stackoverflow.com/a/30800715
    async downloadDictionary(dictionary: Dictionary) {
        const downloadAnchorElement = document.getElementById('downloadAnchorElem');
        if (!downloadAnchorElement) return;
        const data = await lastValueFrom(this.httpService.getDictionary(dictionary.title, true));
        downloadAnchorElement.setAttribute('href', this.generateDataString(data));
        downloadAnchorElement.setAttribute('download', 'dictionary.json');
        downloadAnchorElement.click();
    }

    private async deleteAllDictionaries() {
        await lastValueFrom(this.httpService.deleteAllDictionariesExceptDefault());
        if (this.httpService.anErrorOccurred()) {
            this.clearSuccessMessage();
            this.openErrorDialog();
            await this.handleRefresh();
            return;
        }
        this.successMessage = SUCCESSFUL_DELETE_ALL_MESSAGE;
        await this.handleRefresh();
    }

    private isDictionaryUpdated(initialDictionary: Dictionary, newDictionary: Dictionary): boolean {
        return initialDictionary.title !== newDictionary.title || initialDictionary.description !== newDictionary.description;
    }
    private generateDataString(dictionary: Dictionary): string {
        return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dictionary));
    }

    private openErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
