import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';

@Component({
    selector: 'app-endgame-popup',
    templateUrl: './endgame-popup.component.html',
    styleUrls: ['./endgame-popup.component.scss'],
})
export class EndGamePopupComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public description: InformationalPopupData, private dialogRef: MatDialogRef<EndGamePopupComponent>) {}
    handleUserAnswer(userAnswer: boolean) {
        this.dialogRef.close(userAnswer);
    }
}
