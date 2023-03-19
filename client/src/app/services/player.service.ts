import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { DEFAULT_ACCOUNT } from '@app/constants/constants';
import { Account } from '@app/interfaces/account';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { UserSettings } from '@app/interfaces/serveur info exchange/user-settings';
import { lastValueFrom } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;
    room: Room;
    account: ClientAccountInfo = DEFAULT_ACCOUNT;
    isNewChatWindowOpen: boolean;
    constructor(private httpService?: HttpService) {
        this.isNewChatWindowOpen = false;
        this.room = new Room();
        this.player = new Player();
        // TODO: remove this bypass for disabled logging
        this.player.email = 'anna@polyscrabble.ca';
        // TODO: Remove this call once logging is re enabled
        this.getPlayerInfo();
    }
    getPlayerInfo() {
        if (!this.httpService) return;
        this.httpService.getUserInfo(this.player.email).subscribe((userInfo) => (this.account = userInfo));
    }
    reducePLayerInfo(): Account {
        return {
            username: this.account.username,
            email: this.account.email,
            badges: this.account.badges,
            gamesWon: this.account.gamesWon,
            userSettings: this.account.userSettings,
            totalXP: this.account.progressInfo.totalXP,
            gamesPlayed: this.account.gamesPlayed,
            bestGames: this.account.bestGames,
        };
    }
    async updateUserSettings(newSettings: UserSettings) {
        if (!this.httpService) return;
        this.account.userSettings = newSettings;
        this.account = await lastValueFrom(this.httpService.updateUserSettings(this.account.email, this.account));
    }
}
