import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let themeService: ThemeService;
    let playerService: PlayerService;

    beforeEach(async () => {
        playerService = new PlayerService();
        themeService = new ThemeService(playerService);

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, TranslateModule.forRoot()],
            providers: [{ provide: ThemeService, useValue: themeService }, { provide: HttpService }],
            declarations: [HeaderComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
