import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { PredefinedAvatarsPopupComponent } from './predefined-avatars-popup.component';

describe('PredefinedAvatarsPopupComponent', () => {
    let component: PredefinedAvatarsPopupComponent;
    let fixture: ComponentFixture<PredefinedAvatarsPopupComponent>;
    let dialogReference: MatDialogRef<PredefinedAvatarsPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PredefinedAvatarsPopupComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(PredefinedAvatarsPopupComponent);
        component = fixture.componentInstance;
        dialogReference = fixture.debugElement.injector.get(MatDialogRef);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleUserChoice tests', () => {
        it('should close the dialog with avatar file if it is not null', () => {
            const expectedResult = {} as unknown as File;
            component.currentAvatar = expectedResult;

            const spy = spyOn(dialogReference, 'close');
            component.handleUserChoice();
            expect(spy).toHaveBeenCalledWith(expectedResult);
        });
        it('should close the dialog with avatar url if the currentFile is null', () => {
            component.currentAvatar = null;
            const expectedResult = 'imgUrl';
            component.currentAvatarURL = expectedResult;
            const spy = spyOn(dialogReference, 'close');
            component.handleUserChoice();
            expect(spy).toHaveBeenCalledWith(expectedResult);
        });
    });
});
