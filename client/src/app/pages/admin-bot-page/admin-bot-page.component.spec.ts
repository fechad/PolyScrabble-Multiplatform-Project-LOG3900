import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBotPageComponent } from './admin-bot-page.component';

describe('AdminBotPageComponent', () => {
    let component: AdminBotPageComponent;
    let fixture: ComponentFixture<AdminBotPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminBotPageComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminBotPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
