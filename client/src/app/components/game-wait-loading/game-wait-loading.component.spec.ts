import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWaitLoadingComponent } from './game-wait-loading.component';

describe('GameWaitLoadingComponent', () => {
    let component: GameWaitLoadingComponent;
    let fixture: ComponentFixture<GameWaitLoadingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameWaitLoadingComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameWaitLoadingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
