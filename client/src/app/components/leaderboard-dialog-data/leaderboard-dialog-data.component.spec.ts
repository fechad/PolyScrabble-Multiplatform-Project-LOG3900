import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LeaderboardDialogDataComponent } from './leaderboard-dialog-data.component';
export class MatDialogRefMock {
    close() {
        return;
    }
}
describe('LeaderboardDialogDataComponent', () => {
    let component: LeaderboardDialogDataComponent;
    let fixture: ComponentFixture<LeaderboardDialogDataComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaderboardDialogDataComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeaderboardDialogDataComponent);
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
