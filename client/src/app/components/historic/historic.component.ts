import { Component } from '@angular/core';
import { PlayerGameStats } from '@app/constants/player-stats';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-historic',
    templateUrl: './historic.component.html',
    styleUrls: ['./historic.component.scss'],
})
export class HistoricComponent {
    gameStat: PlayerGameStats;
    isEnglish: boolean;
    constructor(private playerService: PlayerService) {
        this.gameStat = this.playerService.stats;
    }
}
