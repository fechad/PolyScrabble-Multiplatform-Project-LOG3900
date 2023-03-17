import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpService } from '@app/services/http.service';

import { ChatWindowPageComponent } from './chat-window-page.component';

describe('ChatWindowComponent', () => {
    let component: ChatWindowPageComponent;
    let fixture: ComponentFixture<ChatWindowPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [ChatWindowPageComponent],
            providers: [{ provide: HttpService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatWindowPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
