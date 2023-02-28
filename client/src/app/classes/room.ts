import { Injectable } from '@angular/core';
import { Player } from './player';
import { RoomInfo } from './room-info';

// TODO: Create room service as injectable instead of room
@Injectable({
    providedIn: 'root',
})
export class Room {
    elapsedTime: number;
    currentPlayerPseudo: string; // Remove this, obsolete
    players: Player[];
    roomInfo: RoomInfo;
    isBankUsable: boolean;

    constructor() {
        this.roomInfo = { name: '', creatorName: '', timerPerTurn: '', dictionary: '', gameType: '', maxPlayers: 4, isPublic: true, password: '' };
        this.players = [];
        this.isBankUsable = true;
    }

    reinitialize(gameType: string) {
        this.roomInfo = {
            name: '',
            creatorName: '',
            timerPerTurn: '',
            dictionary: '',
            gameType,
            maxPlayers: 4,
            isPublic: true,
            password: '',
        };
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
