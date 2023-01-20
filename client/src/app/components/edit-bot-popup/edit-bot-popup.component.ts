import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Bot } from '@app/interfaces/bot';
import { HttpService } from '@app/services/http.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-edit-bot-popup',
    templateUrl: './edit-bot-popup.component.html',
    styleUrls: ['./edit-bot-popup.component.scss'],
})
export class EditBotPopupComponent {
    botForm: FormGroup;
    modeEdit: boolean;
    errorMessage: string;
    isProcessing: boolean;
    private initialBot: Bot;
    private botHasBeenEdited;

    constructor(
        @Inject(MAT_DIALOG_DATA) private bot: Bot,
        private fb: FormBuilder,
        private httpService: HttpService,
        private dialogRef: MatDialogRef<EditBotPopupComponent>,
    ) {
        this.initialBot = this.deepCopyBot(bot);
        this.botForm = this.fb.group({
            name: [this.bot.name, [Validators.required, Validators.minLength(1)]],
            gameType: [this.bot.gameType, [Validators.required, Validators.minLength(1)]],
        });
        this.botHasBeenEdited = false;
        this.modeEdit = this.initialBot.name !== '';
        this.errorMessage = '';
        this.isProcessing = false;
    }

    private get name(): string {
        return (this.botForm.controls.name as FormControl).value;
    }

    private get gameType(): string {
        return (this.botForm.controls.gameType as FormControl).value;
    }

    canModifyBot(): boolean {
        return this.hasBeenModified() && this.botForm.valid;
    }

    async modifyBot() {
        const updatedBot = { name: this.name, gameType: this.gameType } as Bot;
        let nameToSearch = this.initialBot.name;
        if (this.initialBot.name === '') {
            nameToSearch = this.name;
        }
        this.displayProcessing();
        const isUnique = await this.isBotNameUnique(updatedBot);
        if (!isUnique) {
            return this.handleDuplicateBot(updatedBot);
        }
        await lastValueFrom(this.httpService.updateBot(nameToSearch, updatedBot));
        if (this.httpService.anErrorOccurred()) {
            return this.handleHttpError();
        }
        this.botHasBeenEdited = true;
        this.dialogRef.close(this.botHasBeenEdited);
    }

    isClosedByEditing(): boolean {
        return this.botHasBeenEdited;
    }

    private handleDuplicateBot(updatedBot: Bot) {
        this.isProcessing = false;
        if (this.httpService.anErrorOccurred()) {
            return this.handleHttpError();
        }
        this.errorMessage = this.generateDuplicateBotMessage(updatedBot);
    }

    private displayProcessing() {
        this.errorMessage = '';
        this.isProcessing = true;
    }

    private generateDuplicateBotMessage(updatedBot: Bot): string {
        const verb = this.modeEdit ? 'éditer' : 'ajouter';
        return `Nous ne pouvons pas ${verb} ce bot car il y a déjà un bot avec le nom "${updatedBot.name}"`;
    }

    private handleHttpError() {
        this.isProcessing = false;
        this.errorMessage = this.httpService.getErrorMessage();
        this.dialogRef.close(false);
    }

    private async isBotNameUnique(updatedBot: Bot): Promise<boolean> {
        const bots: Bot[] = await lastValueFrom(this.httpService.getAllBots());
        let nBotWithSameName = 0;
        for (const bot of bots) {
            if (bot.gameType === updatedBot.gameType && bot.name === updatedBot.name) {
                nBotWithSameName++;
            }
        }
        return nBotWithSameName < 1;
    }

    private hasBeenModified(): boolean {
        return this.nameHasBeenModified() || this.gameTypeHasBeenModified();
    }

    private nameHasBeenModified(): boolean {
        return this.initialBot.name !== this.name;
    }

    private gameTypeHasBeenModified(): boolean {
        return this.initialBot.gameType !== this.gameType;
    }

    private deepCopyBot(bot: Bot) {
        return { name: bot.name.slice(0), gameType: bot.gameType.slice(0) };
    }
}
