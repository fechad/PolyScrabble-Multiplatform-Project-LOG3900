import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { HttpService } from '@app/services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
    let component: SettingsPageComponent;
    let fixture: ComponentFixture<SettingsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, TranslateModule.forRoot()],

            providers: [{ provide: FormBuilder }, { provide: HttpService }, { provide: MatDialog, useClass: MatDialogMock }],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [SettingsPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SettingsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
