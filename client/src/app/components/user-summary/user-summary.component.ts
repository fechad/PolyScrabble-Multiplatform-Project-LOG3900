import { Component, Input } from '@angular/core';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { HttpService } from '@app/services/http.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-user-summary',
    templateUrl: './user-summary.component.html',
    styleUrls: ['./user-summary.component.scss'],
})
export class UserSummaryComponent {
    @Input() isGamePage: boolean;
    playerToShow: ClientAccountInfo | undefined;
    rank: string;
    constructor(
        protected playerService: PlayerService,
        protected objectiveService: OutgameObjectivesService,
        protected httpService: HttpService,
        public objService: OutgameObjectivesService,
    ) {}
}
