import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

import { ChatWindowPageComponent } from './chat-window-page.component';

describe('ChatWindowComponent', () => {
    let component: ChatWindowPageComponent;
    let fixture: ComponentFixture<ChatWindowPageComponent>;
    let themeService: ThemeService;
    let playerService: PlayerService;

    beforeEach(async () => {
        playerService = new PlayerService();
        themeService = new ThemeService(playerService);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [ChatWindowPageComponent],
            providers: [{ provide: HttpService }, { provide: ThemeService, useValue: themeService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatWindowPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
