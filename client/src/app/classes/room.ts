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

    reinitialize(gameType?: string) {
        this.roomInfo = {
            name: '',
            creatorName: '',
            timerPerTurn: '',
            dictionary: '',
            gameType: gameType || '',
            maxPlayers: 4,
            isPublic: true,
            password: '',
        };
        this.players = [];
        this.isBankUsable = true;
        this.botsLevel = '';
        this.currentPlayerPseudo = '';
        this.elapsedTime = 0;
    }

    // tested on game-page.component.spec.ts
    setRoom(roomServer: Room) {
        this.roomInfo.name = roomServer.roomInfo.name;
        this.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.roomInfo.maxPlayers = roomServer.roomInfo.maxPlayers;
        this.setPlayers(roomServer.players);
        this.elapsedTime = roomServer.elapsedTime;
    }

    setPlayers(players: Player[]) {
        if (!players) return;
        this.players = [];
        for (const jsonPlayer of players) {
            const clientPlayer = new Player();
            clientPlayer.setPlayerGameAttributes(jsonPlayer);
            this.players.push(clientPlayer);
        }
    }
}
