import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { ErrorDialogComponent } from './error-dialog.component';

describe('ErrorDialogComponent', () => {
    let component: ErrorDialogComponent;
    let fixture: ComponentFixture<ErrorDialogComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorDialogComponent);
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
