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
});
