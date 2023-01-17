import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDictionariesPageComponent } from './admin-dictionaries-page.component';

describe('AdminDictionariesPageComponent', () => {
    let component: AdminDictionariesPageComponent;
    let fixture: ComponentFixture<AdminDictionariesPageComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminDictionariesPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
