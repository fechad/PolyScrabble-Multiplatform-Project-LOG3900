/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { DiscussionChannelService } from '@app/classes/discussion-channel-service';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { PlayerGameStats } from '@app/constants/player-stats';
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
    playerToShow?: ClientAccountInfo;
    playerToShowStat: PlayerGameStats;
    stats: PlayerGameStats;
    room: Room;
    isNewChatWindowOpen: boolean;
    discussionChannelService: DiscussionChannelService;
    isObserver: boolean;
    constructor(private httpService?: HttpService) {
        this.isNewChatWindowOpen = false;
        this.room = new Room();
        this.player = new Player();
        this.playerToShow = undefined;
        this.discussionChannelService = new DiscussionChannelService();
        this.isObserver = false;
    }

    get account(): ClientAccountInfo {
        return this.player.clientAccountInfo;
    }

    async setUserInfo() {
        if (!this.httpService) return;
        const userInfo = await lastValueFrom(this.httpService.getUserInfo(this.player.email));
        this.player.clientAccountInfo = userInfo;
        this.stats = await lastValueFrom(this.httpService.getPlayerStats(this.player.email));
    }

    async setPlayerToShow(player: ClientAccountInfo) {
        if (!this.httpService) return;
        this.playerToShow = player;
        this.playerToShowStat = await lastValueFrom(this.httpService.getPlayerStats(this.playerToShow.email));
    }

    getPlayerToShow() {
        return this.playerToShow;
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

    setPlayerServiceInfo(playerService: PlayerService) {
        this.player = playerService.player;
        this.stats = playerService.stats;
        this.room = playerService.room;
        this.isNewChatWindowOpen = playerService.isNewChatWindowOpen;
        this.discussionChannelService = playerService.discussionChannelService;
        this.isObserver = playerService.isObserver;
    }

    resetPlayerAndRoomInfo() {
        this.player.resetPlayerInfo();
        this.room.reinitialize();
        this.discussionChannelService.reinitialize();
        this.isObserver = false;
    }

    async updateUserSettings(newSettings: UserSettings, username: string) {
        if (!this.httpService) return;
        // eslint-disable-next-line no-useless-catch
        try {
            const updatedInfo = { ...this.account };
            updatedInfo.userSettings = newSettings;
            updatedInfo.username = username.toLowerCase();

            this.player.clientAccountInfo = await lastValueFrom(this.httpService.updateUserSettings(this.account.email, updatedInfo));

            this.account.userSettings = newSettings;
            this.account.username = username.toLowerCase();
            this.stats = await lastValueFrom(this.httpService.getPlayerStats(this.player.email));
        } catch (e) {
            return e;
        }
    }

    getBorder(level: number) {
        let path = '';
        const borders: { [key: string]: number } = {
            'bronze.png': 10,
            'silver.png': 25,
            'gold.png': 50,
        };
        for (const key in borders) {
            if (level >= borders[key]) path = key;
        }
        return 'assets/images/borders/' + path;
    }
}
