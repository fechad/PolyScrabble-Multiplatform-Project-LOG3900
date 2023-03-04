import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LeaderBoardDialogDataComponent } from './leaderboard-dialog-data.component';
export class MatDialogRefMock {
    close() {
        return;
    }
}
describe('LeaderboardDialogDataComponent', () => {
    let component: LeaderBoardDialogDataComponent;
    let fixture: ComponentFixture<LeaderBoardDialogDataComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaderBoardDialogDataComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeaderBoardDialogDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('calling closeDialog should call close method of the dialog', () => {
        // we need to access to the dialogRef private attribute to test this function
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['dialogRef'], 'close');
        component.closeDialog();
        expect(spy).toHaveBeenCalled();
    });
});
