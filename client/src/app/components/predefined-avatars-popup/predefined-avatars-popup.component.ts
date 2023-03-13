import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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
    constructor(private dialogRef: MatDialogRef<PredefinedAvatarsPopupComponent>) {
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
        return DEFAULT_IMG_URL;
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
}
