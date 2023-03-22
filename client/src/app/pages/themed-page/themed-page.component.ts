import { Component } from '@angular/core';
import { ThemedDifficulty, ThemedTimers } from '@app/constants/themed-mode-constants';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-themed-page',
    templateUrl: './themed-page.component.html',
    styleUrls: ['./themed-page.component.scss'],
})
export class ThemedPageComponent {
    constructor(protected themeService: ThemeService) {}
    get difficulty() {
        return ThemedDifficulty;
    }
    get time() {
        return ThemedTimers;
    }
}
