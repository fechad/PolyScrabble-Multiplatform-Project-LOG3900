import { Component, OnInit } from '@angular/core';
import { ProgressInfo } from '@app/interfaces/progress-info';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    checked = false;
    userInfo: ClientAccountInfo;
    progressInfo: ProgressInfo;
    badgeUrls: string[];
    constructor(public httpService: HttpService, private playerService: PlayerService, protected themeService: ThemeService) {}
    ngOnInit(): void {
        // TODO: uncomment later
        // this.playerService.setUserInfo();
        this.userInfo = this.playerService.account;
        this.progressInfo = this.playerService.account.progressInfo;
    }
}
