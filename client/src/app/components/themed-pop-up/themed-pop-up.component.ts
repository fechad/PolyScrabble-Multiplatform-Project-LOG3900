import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemedSummary } from '@app/interfaces/themed-summary';

@Component({
    selector: 'app-themed-pop-up',
    templateUrl: './themed-pop-up.component.html',
    styleUrls: ['./themed-pop-up.component.scss'],
})
export class ThemedPopUpComponent {
    time: string;
    diff: string[];
    constructor(@Inject(MAT_DIALOG_DATA) public data: ThemedSummary, private dialogRef: MatDialogRef<ThemedPopUpComponent>) {
        const min = 60;
        const last = -2;
        this.time = Math.floor(data.time / min).toString() + 'm' + ('0' + (data.time - Math.floor(data.time / min) * min).toString()).slice(last);
        this.diff = new Array(data.difficulty).fill(' ');
    }
    handleUserAnswer(userAnswer: boolean) {
        this.dialogRef.close(userAnswer);
    }
}
