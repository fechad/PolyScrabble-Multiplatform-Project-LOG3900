import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

import { ThemedPageComponent } from './themed-page.component';

describe('ThemedPageComponent', () => {
    let component: ThemedPageComponent;
    let fixture: ComponentFixture<ThemedPageComponent>;
    let themeService: ThemeService;
    let playerService: PlayerService;

    beforeEach(async () => {
        playerService = new PlayerService();
        themeService = new ThemeService(playerService);

        await TestBed.configureTestingModule({
            providers: [{ provide: ThemeService, useValue: themeService }],
            declarations: [ThemedPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ThemedPageComponent);
        component = fixture.componentInstance;
        themeService = fixture.debugElement.injector.get(ThemeService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
