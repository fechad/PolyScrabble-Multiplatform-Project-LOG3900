import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;

    constructor() {
        this.player = new Player();
    }

    setPlayer(socketId: string, email: string, pseudo: string) {
        this.player.email = email;
        this.player.pseudo = pseudo;
        this.player.socketId = socketId;
    }

    getPlayer(): Player {
        return this.player;
    }
}
