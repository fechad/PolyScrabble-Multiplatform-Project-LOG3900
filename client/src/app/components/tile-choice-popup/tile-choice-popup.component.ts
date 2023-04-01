import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LETTER_CHOICES } from '@app/constants/rack-constants';

@Component({
    selector: 'app-tile-choice-popup',
    templateUrl: './tile-choice-popup.component.html',
    styleUrls: ['./tile-choice-popup.component.scss'],
})
export class TileChoicePopupComponent {
    constructor(private dialogRef: MatDialogRef<TileChoicePopupComponent>) {}

    get letterChoices(): string[] {
        return LETTER_CHOICES;
    }

    selectLetter(letter: string) {
        this.dialogRef.close(letter);
    }
}
