import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Goal } from '@app/interfaces/goal';

@Component({
    selector: 'app-goal-dialog-data',
    templateUrl: './goal-dialog-data.component.html',
    styleUrls: ['./goal-dialog-data.component.scss'],
})
export class GoalDialogDataComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public goal: Goal, private dialogRef: MatDialogRef<GoalDialogDataComponent>) {}

    closeDialog() {
        this.dialogRef.close();
    }
}
