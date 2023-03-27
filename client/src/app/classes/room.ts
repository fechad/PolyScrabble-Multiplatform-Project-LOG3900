import { PlacementData } from '@app/interfaces/placement-data';
import { RoomObserver } from '@app/interfaces/room-observer';
import { Player } from './player';
import { RoomInfo } from './room-info';

export class Room {
    elapsedTime: number; // elapsedTime must be 0 only before the start of the game. Once it starts, it can't be 0 again. (so 1 to timerPerTurn)
    currentPlayerPseudo: string; // Remove this, obsolete
    players: Player[];
    observers: RoomObserver[];
    roomInfo: RoomInfo;
    isBankUsable: boolean;
    botsLevel: string;
    placementsData: PlacementData[];

    constructor() {
        this.roomInfo = { name: '', creatorName: '', timerPerTurn: '', dictionary: '', gameType: '', maxPlayers: 4, isPublic: true, password: '' };
        this.players = [];
        this.observers = [];
        this.placementsData = [];
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
        this.observers = [];
        this.placementsData = [];
        this.isBankUsable = true;
        this.botsLevel = '';
        this.currentPlayerPseudo = '';
        this.elapsedTime = 0;
    }

    // tested on game-page.component.spec.ts
    setRoom(roomServer: Room) {
        this.roomInfo = { ...roomServer.roomInfo };
        this.setPlayers(roomServer.players);
        this.elapsedTime = roomServer.elapsedTime;
        this.placementsData = roomServer.placementsData;
        this.botsLevel = roomServer.botsLevel;
        this.observers = roomServer.observers;
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

    removePlayerByName(playerName: string) {
        const playerToRemove = this.players.find((player: Player) => player.pseudo === playerName);
        if (!playerToRemove) return;
        this.players.splice(this.players.indexOf(playerToRemove), 1);
    }
}
