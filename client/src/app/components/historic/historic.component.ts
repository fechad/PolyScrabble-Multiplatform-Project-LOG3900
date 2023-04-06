import { Component } from '@angular/core';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-historic',
    templateUrl: './historic.component.html',
    styleUrls: ['./historic.component.scss'],
})
export class HistoricComponent {
    isEnglish: boolean;
    constructor(private playerService: PlayerService) {}
    get gameStat() {
        return this.playerService.stats;
    }
}
