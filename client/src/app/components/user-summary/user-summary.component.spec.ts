import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSummaryComponent } from './user-summary.component';

describe('UserSummaryComponent', () => {
    let component: UserSummaryComponent;
    let fixture: ComponentFixture<UserSummaryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserSummaryComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(UserSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
