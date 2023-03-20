import { Component } from '@angular/core';
import { ThemedDifficulty, ThemedTimers } from '@app/constants/themed-turn-timers';

@Component({
    selector: 'app-themed-page',
    templateUrl: './themed-page.component.html',
    styleUrls: ['./themed-page.component.scss'],
})
export class ThemedPageComponent {
    get difficulty() {
        return ThemedDifficulty;
    }
    get time() {
        return ThemedTimers;
    }
}
