import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { GeneralChatComponent } from './general-chat.component';

export class MatDialogRefMock {
    close() {
        return;
    }
}

describe('GeneralChatComponent', () => {
    let component: GeneralChatComponent;
    let fixture: ComponentFixture<GeneralChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GeneralChatComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(GeneralChatComponent);
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
