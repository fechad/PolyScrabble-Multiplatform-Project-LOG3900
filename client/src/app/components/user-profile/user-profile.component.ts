import { Component } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
    checked = false;
    badgeUrls: string[];
    constructor(public httpService: HttpService, private playerService: PlayerService, protected themeService: ThemeService) {}
    get userInfo() {
        return this.playerService.account;
    }
    get progressInfo() {
        return this.playerService.account.progressInfo;
    }
}
