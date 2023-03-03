import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestScoresPageComponent } from './best-scores-page.component';

describe('BestScoresPageComponent', () => {
    let component: BestScoresPageComponent;
    let fixture: ComponentFixture<BestScoresPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BestScoresPageComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
