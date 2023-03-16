import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { DEFAULT_ACCOUNT } from '@app/constants/constants';
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
    constructor(private httpService?: HttpService) {
        this.room = new Room();
        this.player = new Player();
        // TODO: remove this bypass for disabled logging
        this.player.email = 'kurama@polyscrabble.ca';
        // TODO: Remove this call once logging is re enabled
        this.getPlayerInfo();
    }
    getPlayerInfo() {
        if (!this.httpService) return;
        this.httpService.getUserInfo(this.player.email).subscribe((userInfo) => (this.account = userInfo));
    }
    async updateUserSettings(newSettings: UserSettings) {
        if (!this.httpService) return;
        this.account = await lastValueFrom(this.httpService.updateUserSettings(this.account.email, newSettings));
    }
}
