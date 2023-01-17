import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWaitLoadingComponent } from './game-wait-loading.component';

describe('GameWaitLoadingComponent', () => {
    let component: GameWaitLoadingComponent;
    let fixture: ComponentFixture<GameWaitLoadingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameWaitLoadingComponent],
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
