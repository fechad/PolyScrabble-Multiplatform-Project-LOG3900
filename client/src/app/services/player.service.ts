import { Injectable } from '@angular/core';
import { DiscussionChannelService } from '@app/classes/discussion-channel-service';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
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
    isNewChatWindowOpen: boolean;
    discussionChannelService: DiscussionChannelService;

    constructor(private httpService?: HttpService) {
        this.isNewChatWindowOpen = false;
        this.room = new Room();
        this.player = new Player();
        this.discussionChannelService = new DiscussionChannelService();
    }

    get account(): ClientAccountInfo {
        return this.player.clientAccountInfo;
    }

    async setUserInfo() {
        if (!this.httpService) return;
        const userInfo = await lastValueFrom(this.httpService.getUserInfo(this.player.email));
        this.player.clientAccountInfo = userInfo;
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

    resetPlayerAndRoomInfo() {
        this.player.resetPlayerInfo();
        this.room.reinitialize();
    }

    async updateUserSettings(newSettings: UserSettings) {
        if (!this.httpService) return;
        this.account.userSettings = newSettings;
        this.player.clientAccountInfo = await lastValueFrom(this.httpService.updateUserSettings(this.account.email, this.account));
    }
}
