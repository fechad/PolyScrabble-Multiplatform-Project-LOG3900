import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { PredefinedAvatarsPopupComponent } from '@app/components/predefined-avatars-popup/predefined-avatars-popup.component';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { lastValueFrom } from 'rxjs';

const DEFAULT_IMG_URL = 'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/EinsteinAvatar_n2h25k.png';

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    currentAvatar: File | null;
    fileReader: FileReader;
    isPredefinedAvatar: boolean;
    protected settingsForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private dialog: MatDialog, private httpService: HttpService, private playerService: PlayerService) {
        this.settingsForm = this.formBuilder.group({
            avatarURL: [this.playerService.account.avatarUrl || DEFAULT_IMG_URL, [Validators.required]],
            theme: ['', [Validators.required]],
            language: ['', [Validators.required]],
            music: ['', [Validators.required]],
        });

        this.fileReader = new FileReader();
        this.currentAvatar = null;
    }

    get avatarURL(): string {
        return this.settingsForm.controls.avatarURL.value;
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
    ngOnInit(): void {}

    async sendData() {
        if (this.currentAvatar) {
            await this.uploadFile();
            return;
        }
        this.chosePredefinedAvatar();
    }

    openAvatarUrlsChoices() {
        const dialog = this.dialog.open(PredefinedAvatarsPopupComponent, {
            width: '600px',
            autoFocus: true,
        });

        dialog.afterClosed().subscribe(async (avatarFile) => {
            if (!avatarFile) return;
            if (typeof avatarFile === 'string' || avatarFile instanceof String) {
                this.settingsForm.controls.avatarURL.setValue(avatarFile);
                this.currentAvatar = null;
                return;
            }
            this.selectAvatar(avatarFile);
        });
    }

    private selectAvatar(avatarFile: File) {
        this.currentAvatar = avatarFile;

        this.fileReader.onload = () => {
            this.settingsForm.controls.avatarURL.setValue(this.fileReader.result);
        };

        this.fileReader.readAsDataURL(this.currentAvatar);
    }

    private chosePredefinedAvatar() {
        if (!this.avatarURL) return;
        this.playerService.account.avatarUrl = this.avatarURL;
        this.updateUserInfo();
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

        this.playerService.account.avatarUrl = response.url;
        this.updateUserInfo();
    }

    private updateUserInfo() {
        // TODO: modify user db info
        return;
    }

    private openErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
