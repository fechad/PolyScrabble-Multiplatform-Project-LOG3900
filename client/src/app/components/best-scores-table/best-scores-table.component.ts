import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Score } from '@app/classes/score';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { lastValueFrom } from 'rxjs';

export const DEFAULT_DICTIONARY_TITLE = 'français';
export const SUCCESSFUL_REINITIALIZE_SCORES = 'Vos scores ont tous été réinitialisés';

@Component({
    selector: 'app-best-scores-table',
    templateUrl: './best-scores-table.component.html',
    styleUrls: ['./best-scores-table.component.scss'],
})
export class BestScoresTableComponent implements AfterViewInit {
    @Input() scores: Score[];
    successMessage: string;
    constructor(private httpService: HttpService, private dialog: MatDialog) {
        this.scores = [];
        this.successMessage = '';
    }

    async ngAfterViewInit() {
        await this.handleRefresh();
    }
    async handleRefresh() {
        const updatedScores = await lastValueFrom(this.httpService.fetchAllScores());
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            this.scores = [];
            return;
        }
        this.scores = updatedScores;
    }

    async handleReinitializeScores() {
        const description: InformationalPopupData = {
            header: 'Voulez-vous vraiment réinitiliser les scores?',
            body: 'Tous les scores seront effacés pour ne garder que les valeurs par defauts.',
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.reinitializeScores();
        });
    }

    clearSuccessMessage() {
        this.successMessage = '';
    }
    private async reinitializeScores() {
        await lastValueFrom(this.httpService.reinitializeScores());
        if (this.httpService.anErrorOccurred()) {
            this.clearSuccessMessage();
            this.openErrorDialog();
            await this.handleRefresh();
            return;
        }
        this.successMessage = SUCCESSFUL_REINITIALIZE_SCORES;
        await this.handleRefresh();
    }

    private openErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
