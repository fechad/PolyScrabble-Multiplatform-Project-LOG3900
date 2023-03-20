import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemedPageComponent } from './themed-page.component';

describe('ThemedPageComponent', () => {
    let component: ThemedPageComponent;
    let fixture: ComponentFixture<ThemedPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ThemedPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ThemedPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
