import { Player } from './player';
import { RoomInfo } from './room-info';

export class Room {
    elapsedTime: number;
    currentPlayerPseudo: string; // Remove this, obsolete
    players: Player[];
    roomInfo: RoomInfo;
    isBankUsable: boolean;
    botsLevel: string;

    constructor() {
        this.roomInfo = { name: '', creatorName: '', timerPerTurn: '', dictionary: '', gameType: '', maxPlayers: 4, isPublic: true, password: '' };
        this.players = [];
        this.isBankUsable = true;
        this.botsLevel = 'adaptive';
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

    // tested on game-page.component.spec.ts
    setRoom(roomServer: Room) {
        this.roomInfo.name = roomServer.roomInfo.name;
        this.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.roomInfo.maxPlayers = roomServer.roomInfo.maxPlayers;
        this.players = roomServer.players;
        this.elapsedTime = roomServer.elapsedTime;
    }
}
