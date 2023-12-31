import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { PasswordChangerPopupComponent } from '@app/components/password-changer-popup/password-changer-popup.component';
import { PredefinedAvatarsPopupComponent } from '@app/components/predefined-avatars-popup/predefined-avatars-popup.component';
import { DEFAULT_USER_IMAGE } from '@app/constants/default-user-settings';
import { VICTORY_MUSIC } from '@app/constants/victory-musics';
import { UserSettings } from '@app/interfaces/serveur info exchange/user-settings';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { LanguageService } from '@app/services/language.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { lastValueFrom } from 'rxjs';

const SAFE_GUARD_TIMEOUT = 3000;

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent extends PageCommunicationManager implements OnInit {
    currentAvatar: File | null;
    fileReader: FileReader;
    isPredefinedAvatar: boolean;
    userSettings: UserSettings;
    userName: string;
    invalidUsernameMessage: string;
    musicOptions: { key: string; value: string }[];
    avatarChanged: boolean;
    isInProcess: boolean;
    protected settingsForm: FormGroup;
    constructor(
        protected socketService: SocketClientService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private httpService: HttpService,
        private playerService: PlayerService,
        protected themeService: ThemeService,
        protected languageService: LanguageService,
    ) {
        super(socketService);
        this.userSettings = this.playerService.account.userSettings;
        this.avatarChanged = false;
        this.isInProcess = false;
        this.musicOptions = Object.entries(VICTORY_MUSIC).map(([key, value]) => ({ key, value }));
        this.settingsForm = this.formBuilder.group({
            avatarUrl: [this.userSettings.avatarUrl || DEFAULT_USER_IMAGE, [Validators.required]],
            username: [this.playerService.account.username, [Validators.required]],
            defaultTheme: [this.userSettings.defaultTheme, [Validators.required]],
            defaultLanguage: [this.userSettings.defaultLanguage, [Validators.required]],
            victoryMusic: [this.userSettings.victoryMusic, [Validators.required]],
        });
        this.invalidUsernameMessage = '';
        themeService.verifyTheme();
        languageService.verifyLanguage();
        this.fileReader = new FileReader();
        this.currentAvatar = null;
    }

    get avatarURL(): string {
        return this.settingsForm.controls.avatarUrl.value;
    }

    get changed(): boolean {
        return this.settingsForm.controls.username.value !== this.playerService.account.username || this.settingsForm.dirty || this.avatarChanged;
    }
    ngOnInit(): void {
        this.connectSocket();
    }

    async sendData() {
        this.isInProcess = true;

        setTimeout(() => {
            this.isInProcess = false;
        }, SAFE_GUARD_TIMEOUT);

        if (this.currentAvatar) {
            await this.uploadFile();
            await this.updateUserInfo();
            this.settingsForm.markAsPristine();
            this.avatarChanged = false;
            this.isInProcess = false;
            return;
        }
        this.settingsForm.markAsPristine();
        await this.updateUserInfo();
        this.avatarChanged = false;
        this.isInProcess = false;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMusicSelectionChange(event: any) {
        this.settingsForm.patchValue({
            victoryMusic: event.target.value,
        });
        this.settingsForm.markAsDirty();
    }

    openAvatarUrlsChoices() {
        const dialog = this.dialog.open(PredefinedAvatarsPopupComponent, {
            width: '600px',
            autoFocus: true,
        });

        dialog.afterClosed().subscribe(async (avatarFile) => {
            if (!avatarFile) return;
            this.avatarChanged = true;
            if (typeof avatarFile === 'string' || avatarFile instanceof String) {
                this.settingsForm.controls.avatarUrl.setValue(avatarFile);
                this.currentAvatar = null;
                return;
            }
            this.selectAvatar(avatarFile);
        });
    }

    changePassword() {
        const dialog = this.dialog.open(PasswordChangerPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });

        dialog.afterClosed().subscribe(async (oldPassword) => {
            if (!oldPassword) return;
            // this.socketService.send(SocketEvent.CreateChatChannel, {
            //     channel: channelName,
            //     username: this.playerService.reducePLayerInfo(),
            //     isRoomChannel: false,
            // });
        });
    }

    protected configureBaseSocketFeatures() {
        return;
    }

    private selectAvatar(avatarFile: File) {
        this.currentAvatar = avatarFile;

        this.fileReader.onload = () => {
            this.settingsForm.controls.avatarUrl.setValue(this.fileReader.result);
        };

        this.fileReader.readAsDataURL(this.currentAvatar);
    }

    private async uploadFile() {
        if (!this.currentAvatar) return;
        const signature = await lastValueFrom(this.httpService.getCloudinarySignature());
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            return;
        }

        const data = new FormData();
        data.append('file', this.currentAvatar);
        data.append('api_key', signature.apiKey);
        data.append('timestamp', signature.timestamp);
        data.append('signature', signature.signature);

        const response = await lastValueFrom(this.httpService.uploadFile(data));
        if (this.httpService.anErrorOccurred()) {
            this.openErrorDialog();
            return;
        }
        if (!response) return;
        this.settingsForm.controls.avatarUrl.setValue(response.url);
    }

    private async updateUserInfo() {
        const formValues: UserSettings = {
            avatarUrl: this.settingsForm.controls.avatarUrl.value,
            defaultLanguage: this.settingsForm.controls.defaultLanguage.value,
            defaultTheme: this.settingsForm.controls.defaultTheme.value,
            victoryMusic: this.settingsForm.controls.victoryMusic.value,
        };

        this.playerService.updateUserSettings(formValues, this.settingsForm.controls.username.value).then((res) => {
            if (res) {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if ((res as HttpResponse<unknown>).status === 500) {
                    if (this.playerService.player.clientAccountInfo.userSettings.defaultLanguage === 'english')
                        this.invalidUsernameMessage = 'This username is already taken';
                    else this.invalidUsernameMessage = 'Ce pseudo est déjà utilisé';
                    return;
                }
                this.playerService.account.userSettings.avatarUrl = this.settingsForm.controls.avatarUrl.value;
            } else this.invalidUsernameMessage = '';
        });
    }

    private openErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
