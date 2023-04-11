/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { HttpService } from '@app/services/http.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';
// eslint-disable-next-line no-restricted-imports

@Component({
    selector: 'app-other-user-profile',
    templateUrl: './other-user-profile.component.html',
    styleUrls: ['./other-user-profile.component.scss'],
})
export class OtherUserProfileComponent implements OnInit {
    playerToShow: ClientAccountInfo | undefined;
    rank: string;
    constructor(
        public httpService: HttpService,
        public playerService: PlayerService,
        public themeService: ThemeService,
        public objService: OutgameObjectivesService,
    ) {
        this.playerToShow = playerService.playerToShow;
    }

    ngOnInit(): void {
        this.objService.objectives = [];
        this.objService.generateObjectives(this.playerService.playerToShowStat, this.playerToShow || this.playerService.account);
        this.rank = this.playerService.getBorder(this.objService.currentLevel);
    }
}
