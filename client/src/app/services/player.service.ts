import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { DEFAULT_ACCOUNT } from '@app/constants/constants';
import { Account } from '@app/interfaces/account';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;
    room: Room;
    account: Account;
    constructor() {
        this.room = new Room();
        this.player = new Player();
        this.account = DEFAULT_ACCOUNT;
    }
}
