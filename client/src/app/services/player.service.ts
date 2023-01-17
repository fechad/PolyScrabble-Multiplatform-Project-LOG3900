import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;

    setPlayer(socketId: string, pseudo: string) {
        this.player.pseudo = pseudo;
        this.player.socketId = socketId;
    }

    getPlayer(): Player {
        return this.player;
    }
}
