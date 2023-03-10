import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
    let component: SettingsPageComponent;
    let fixture: ComponentFixture<SettingsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [{ provide: FormBuilder }],
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
