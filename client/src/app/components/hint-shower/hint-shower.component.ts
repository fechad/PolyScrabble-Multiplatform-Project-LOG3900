import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hint } from '@app/interfaces/hint';

@Component({
    selector: 'app-hint-shower',
    templateUrl: './hint-shower.component.html',
    styleUrls: ['./hint-shower.component.scss'],
})
export class HintShowerComponent {
    hints: string[][];
    constructor(@Inject(MAT_DIALOG_DATA) public data: Hint, private dialogRef: MatDialogRef<HintShowerComponent>) {
        this.hints = [];
        for (const hint of data.hints) {
            if (hint.split('_').length === 2) this.hints.push(hint.split('_'));
        }
    }

    closePopUp(hint: string[]) {
        this.dialogRef.close(hint[0]);
    }
}
