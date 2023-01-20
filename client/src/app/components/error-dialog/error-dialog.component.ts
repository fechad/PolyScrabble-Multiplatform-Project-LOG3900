import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public errorMessage: string, private dialogRef: MatDialogRef<ErrorDialogComponent>) {}
    closeDialog(): void {
        this.dialogRef.close();
    }
}
