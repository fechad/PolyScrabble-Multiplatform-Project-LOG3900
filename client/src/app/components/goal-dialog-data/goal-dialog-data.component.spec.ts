import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GoalDialogDataComponent } from './goal-dialog-data.component';

export class MatDialogRefMock {
    close() {
        return;
    }
}

describe('GoalDialogDataComponent', () => {
    let component: GoalDialogDataComponent;
    let fixture: ComponentFixture<GoalDialogDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GoalDialogDataComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalDialogDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('calling closeDialog should call close method of the dialog', () => {
        // eslint-disable-next-line dot-notation -- we need to access to the dialogRef private attribute to test this function
        const spy = spyOn(component['dialogRef'], 'close');
        component.closeDialog();
        expect(spy).toHaveBeenCalled();
    });
});
