import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { PlayerService } from '@app/services/player.service';

const ONE_MB = 1048576;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const MAXIMUM_SIZE = ONE_MB * 2;

const DEFAULT_IMG_URL = 'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/EinsteinAvatar_n2h25k.png';
@Component({
    selector: 'app-predefined-avatars-popup',
    templateUrl: './predefined-avatars-popup.component.html',
    styleUrls: ['./predefined-avatars-popup.component.scss'],
})
export class PredefinedAvatarsPopupComponent {
    currentAvatar: File | null;
    fileReader: FileReader;
    currentAvatarURL: string;
    predefinedAvatarsUrl: string[];
    constructor(private playerService: PlayerService, private dialogRef: MatDialogRef<PredefinedAvatarsPopupComponent>, private dialog: MatDialog) {
        this.currentAvatar = null;
        this.currentAvatarURL = '';
        this.fileReader = new FileReader();

        this.predefinedAvatarsUrl = [
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/EinsteinAvatar_n2h25k.png',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/SantaAvatar_vhamtv.png',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/defaultAvatar_irwvz0.png',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678657051/hmqljwvfskx43vohldyz.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651607/cld-sample-5.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651606/cld-sample-4.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651606/cld-sample-3.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651605/cld-sample.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651586/samples/sheep.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651586/samples/people/smiling-man.jpg',
            'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651584/samples/people/kitchen-bar.jpg',
        ];
    }

    get defaultAvatarUrl() {
        return this.playerService.account.userSettings.avatarUrl || DEFAULT_IMG_URL;
    }

    get isFrenchLanguage() {
        return this.playerService.account.userSettings.defaultLanguage === 'french';
    }

    selectPredefinedAvatar(predefinedAvatarUrl: string) {
        this.currentAvatar = null;
        this.currentAvatarURL = predefinedAvatarUrl;
    }

    isSelected(predefinedAvatarUrl: string): boolean {
        return this.currentAvatarURL === predefinedAvatarUrl;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onProfilePictureSelected(event: any) {
        if (event.target.files[0].size > MAXIMUM_SIZE) {
            return this.isFrenchLanguage
                ? this.openErrorDialog(`Le fichier est trop gros! On accèpte juste une taille maximale de ${MAXIMUM_SIZE / ONE_MB}MB`)
                : this.openErrorDialog(`The file is too big! We only accept a maximum size of ${MAXIMUM_SIZE / ONE_MB}MB`);
        }
        this.currentAvatar = event.target.files[0] as File;
        this.currentAvatarURL = '';

        this.fileReader.onload = () => {
            this.currentAvatarURL = this.fileReader.result as string;
        };

        this.fileReader.readAsDataURL(this.currentAvatar);
    }

    closePopup() {
        this.dialogRef.close();
    }

    handleUserChoice() {
        this.dialogRef.close(this.currentAvatar || this.currentAvatarURL);
    }

    private openErrorDialog(errorMessage: string) {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: errorMessage,
        });
    }
}
