import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/goal-dialog-data/goal-dialog-data.component.spec';
import { TileChoicePopupComponent } from './tile-choice-popup.component';

describe('TileChoicePopupComponent', () => {
    let component: TileChoicePopupComponent;
    let fixture: ComponentFixture<TileChoicePopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileChoicePopupComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(TileChoicePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
