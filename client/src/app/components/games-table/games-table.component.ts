import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { Game } from '@app/interfaces/game';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { lastValueFrom } from 'rxjs';

export const DEFAULT_DICTIONARY_TITLE = 'français';
export const SUCCESSFUL_REINITIALIZE_HISTORY = 'Vos parties ont toutes été réinitialisées';

@Component({
    selector: 'app-games-table',
    templateUrl: './games-table.component.html',
    styleUrls: ['./games-table.component.scss'],
})
export class GamesTableComponent implements AfterViewInit {
    @Input() games: Game[];
    successMessage: string;
    constructor(private httpService: HttpService, private dialog: MatDialog) {
        this.games = [];
        this.successMessage = '';
    }

    async ngAfterViewInit() {
        await this.handleRefresh();
    }
    async handleRefresh() {
        const updatedGames = await lastValueFrom(this.httpService.getAllGames());
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            this.games = [];
            return;
        }
        this.games = updatedGames;
    }

    async handleReinitializeHistory() {
        const description: InformationalPopupData = {
            header: 'Voulez-vous vraiment réinitialiser les parties?',
            body: 'Toutes les parties jouées seront effacées ',
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.reinitializeHistory();
        });
    }

    clearSuccessMessage() {
        this.successMessage = '';
    }

    private async reinitializeHistory() {
        await lastValueFrom(this.httpService.reinitializeHistory());
        if (this.httpService.anErrorOccurred()) {
            this.clearSuccessMessage();
            this.openErrorDialog();
            await this.handleRefresh();
            return;
        }
        this.successMessage = SUCCESSFUL_REINITIALIZE_HISTORY;
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
