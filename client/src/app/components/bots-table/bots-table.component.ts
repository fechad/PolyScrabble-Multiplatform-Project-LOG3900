import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditBotPopupComponent } from '@app/components/edit-bot-popup/edit-bot-popup.component';
import { ConfirmationPopupComponent } from '@app/confirmation-popup/confirmation-popup.component';
import { DEFAULT_BOTS_NAME } from '@app/constants/constants';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { lastValueFrom } from 'rxjs';

export const SUCCESSFUL_DELETE_MESSAGE = 'Votre joueur a été effacé';
export const SUCCESSFUL_DELETE_ALL_MESSAGE = 'Vos joueurs ont tous été effacés';

@Component({
    selector: 'app-bots-table',
    templateUrl: './bots-table.component.html',
    styleUrls: ['./bots-table.component.scss'],
})
export class BotsTableComponent implements AfterViewInit {
    @Input() bots: Bot[];
    successMessage: string;
    constructor(private httpService: HttpService, private dialog: MatDialog) {
        this.bots = [];
        this.successMessage = '';
    }
    get beginners() {
        return this.bots.filter((e) => e.gameType === 'débutant');
    }

    get experts() {
        return this.bots.filter((e) => e.gameType === 'expert');
    }

    async ngAfterViewInit() {
        await this.handleRefresh();
    }

    validateBotDeletionWithUser(bot: Bot) {
        const description: InformationalPopupData = {
            header: 'Voulez-vous effacer ce joueur ?',
            body: `Le joueur "${bot.name}" sera effacé.\n\nCette action sera définitive.`,
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.deleteBot(bot.name);
        });
    }

    async handleRefresh() {
        const updateBots = await lastValueFrom(this.httpService.getAllBots());
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            this.bots = [];
            return;
        }
        this.bots = updateBots;
    }

    async deleteBot(name: string) {
        await lastValueFrom(this.httpService.deleteBot(name));
        await this.handleRefresh();
    }

    canBeDeleted(name: string): boolean {
        return !DEFAULT_BOTS_NAME.includes(name);
    }

    addBot(gameType: string) {
        const dialog = this.dialog.open(EditBotPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: {
                name: '',
                gameType,
            } as Bot,
        });
        let botChanged = false;
        dialog.beforeClosed().subscribe(() => {
            botChanged = dialog.componentInstance.isClosedByEditing();
        });
        dialog.afterClosed().subscribe(async () => {
            if (!botChanged) return;
            await this.handleRefresh();
        });
    }

    handleResetBots() {
        const description: InformationalPopupData = {
            header: 'Voulez-vous vraiment réinitiliser les tables ?',
            body: `Tous les joueurs sauf ceux par défaut '${DEFAULT_BOTS_NAME}' seront effacés`,
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            await this.deleteAllBots();
        });
    }
    clearSuccessMessage() {
        this.successMessage = '';
    }
    async openBotModificationPopup(name: string) {
        const dialog = this.dialog.open(EditBotPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.getBot(name),
        });
        let botChanged = false;
        dialog.beforeClosed().subscribe(() => {
            botChanged = dialog.componentInstance.isClosedByEditing();
        });
        dialog.afterClosed().subscribe(async () => {
            if (!botChanged) return;
            await this.handleRefresh();
        });
    }

    async deleteAllBots() {
        await lastValueFrom(this.httpService.deleteAllBots());
        if (this.httpService.anErrorOccurred()) {
            this.clearSuccessMessage();
            this.openErrorDialog();
            await this.handleRefresh();
            return;
        }
        this.successMessage = SUCCESSFUL_DELETE_ALL_MESSAGE;
        await this.handleRefresh();
    }

    private getBot(name: string) {
        return this.bots.find((element) => element.name === name);
    }

    private openErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
