import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { HttpService } from '@app/services/http.service';
import { ChannelCreationPopupComponent } from './channel-creation-popup.component';

describe('ChannelCreationPopupComponent', () => {
    let component: ChannelCreationPopupComponent;
    let fixture: ComponentFixture<ChannelCreationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [ChannelCreationPopupComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }, { provide: FormBuilder }, { provide: HttpService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChannelCreationPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
