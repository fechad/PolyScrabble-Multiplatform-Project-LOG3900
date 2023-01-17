import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Score } from '@app/classes/score';
@Component({
    selector: 'app-leaderboard-dialog-data',
    templateUrl: './leaderboard-dialog-data.component.html',
    styleUrls: ['./leaderboard-dialog-data.component.scss'],
})
export class LeaderboardDialogDataComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: Score[][], private dialogRef: MatDialogRef<LeaderboardDialogDataComponent>) {}

    closeDialog() {
        this.dialogRef.close();
    }
}
