import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from './confirmation-popup.component';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';

const fakeDescription: InformationalPopupData = { header: '...', body: 'yeap' };
describe('ConfirmationPopupComponent', () => {
    let component: ConfirmationPopupComponent;
    let fixture: ComponentFixture<ConfirmationPopupComponent>;
    let dialogReference: MatDialogRef<ConfirmationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmationPopupComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: fakeDescription },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationPopupComponent);
        component = fixture.componentInstance;
        dialogReference = fixture.debugElement.injector.get(MatDialogRef);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleUserAnswer tests', () => {
        it('should close the dialog with true when passed true', () => {
            const spy = spyOn(dialogReference, 'close');
            component.handleUserAnswer(true);
            expect(spy).toHaveBeenCalledWith(true);
        });
        it('should close the dialog with false when passed false', () => {
            const spy = spyOn(dialogReference, 'close');
            component.handleUserAnswer(false);
            expect(spy).toHaveBeenCalledWith(false);
        });
    });
});
