import { Injectable } from '@angular/core';
import { Player } from './player';
import { RoomInfo } from './room-info';

@Injectable({
    providedIn: 'root',
})
export class Room {
    elapsedTime: number;
    currentPlayerPseudo: string;
    players: Player[];
    roomInfo: RoomInfo;
    isBankUsable: boolean;

    constructor() {
        this.roomInfo = { name: '', timerPerTurn: '', dictionary: '', gameType: '', maxPlayers: 2 };
        this.players = [];
        this.isBankUsable = true;
    }

    addPlayer(player: Player) {
        if (this.players.length < this.roomInfo.maxPlayers) {
            this.players.push(player);
        }
    }

    removePlayer(playerSocketId: string) {
        const playerToRemove = this.players.find((element) => element.socketId === playerSocketId);
        if (playerToRemove) {
            this.players.splice(this.players.indexOf(playerToRemove), 1);
        }
    }
}
