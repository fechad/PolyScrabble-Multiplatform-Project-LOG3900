import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    checked = false;
    badgeUrls: string[];
    constructor(
        public httpService: HttpService,
        private playerService: PlayerService,
        protected themeService: ThemeService,
        public objService: OutgameObjectivesService,
    ) {}

    get userInfo() {
        return this.playerService.account;
    }
    get progressInfo() {
        return this.playerService.account.progressInfo;
    }

    get objectives() {
        return this.objService.objectives;
    }

    get border() {
        return this.playerService.getBorder(this.objService.currentLevel);
    }

    ngOnInit() {
        this.objService.objectives = [];
        this.objService.generateObjectives(this.playerService.stats, this.playerService.account);
    }
}
