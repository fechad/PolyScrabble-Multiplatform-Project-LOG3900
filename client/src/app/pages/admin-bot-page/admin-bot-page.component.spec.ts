import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBotPageComponent } from './admin-bot-page.component';

describe('AdminBotPageComponent', () => {
    let component: AdminBotPageComponent;
    let fixture: ComponentFixture<AdminBotPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminBotPageComponent],
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
