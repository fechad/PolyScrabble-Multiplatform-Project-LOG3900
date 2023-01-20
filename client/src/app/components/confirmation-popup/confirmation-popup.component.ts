import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';

@Component({
    selector: 'app-confirmation-popup',
    templateUrl: './confirmation-popup.component.html',
    styleUrls: ['./confirmation-popup.component.scss'],
})
export class ConfirmationPopupComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public description: InformationalPopupData, private dialogRef: MatDialogRef<ConfirmationPopupComponent>) {}
    handleUserAnswer(userAnswer: boolean) {
        this.dialogRef.close(userAnswer);
    }
}
