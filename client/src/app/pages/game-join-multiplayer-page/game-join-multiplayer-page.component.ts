import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import {
    GAME_REJECTION_BY_ADVERSARY,
    INVALID_PSEUDO,
    INVALID_PSEUDO_LENGTH,
    ROOM_ERROR,
    WAITING_FOR_CONFIRMATION,
} from '@app/constants/status-constants';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-join-multiplayer-page',
    templateUrl: './game-join-multiplayer-page.component.html',
    styleUrls: ['./game-join-multiplayer-page.component.scss', '../dark-theme.scss'],
})
export class GameJoinMultiplayerPageComponent implements OnInit {
    availableRooms: Room[];
    pseudo: string;
    isPseudoValid: boolean;
    isInRoom: boolean;
    isRejected: boolean;
    canJoinRoom: boolean;

    constructor(private socketService: SocketClientService, private router: Router, public room: Room, public player: Player) {
        this.pseudo = '';
        this.isPseudoValid = true;
        this.canJoinRoom = true;
        this.isInRoom = false;
        this.isRejected = false;
        this.room.roomInfo.name = '';
        this.availableRooms = [];
    }

    ngOnInit() {
        this.connect();
        this.getAvailableRooms();
    }

    get roomStatusText(): string {
        if (this.isInRoom) return WAITING_FOR_CONFIRMATION;
        if (this.isRejected) return GAME_REJECTION_BY_ADVERSARY;
        if (this.pseudo.length > MAX_LENGTH_PSEUDO) return INVALID_PSEUDO_LENGTH;
        if (!this.isPseudoValid) return INVALID_PSEUDO;
        if (!this.canJoinRoom) return ROOM_ERROR;
        return '';
    }

    isRoomStatusTextEmpty(): boolean {
        return this.roomStatusText === '';
    }

    askToJoin(creatorRoom: Room) {
        this.isRejected = false;

        if (!this.canJoinCreatorRoom(creatorRoom)) return;

        this.isPseudoValid = true;
        this.isInRoom = true;
        this.availableRooms.splice(this.availableRooms.indexOf(creatorRoom), 1);

        this.player.pseudo = this.pseudo;
        this.player.isCreator = false;
        this.player.socketId = this.socketService.socket.id;
        this.setRoomServerToThisRoom(creatorRoom);
        this.room.addPlayer(this.player);
        this.socketService.send('askToJoin', this.room);
    }

    joinRandomRoom() {
        if (this.roomsWithMyGameType.length === 0) return;
        const maxIndex = this.roomsWithMyGameType.length - 1;
        const roomIndex = Math.floor(Math.random() * (maxIndex + 1));
        this.askToJoin(this.roomsWithMyGameType[roomIndex]);
    }

    getAvailableRooms() {
        this.socketService.send('availableRooms');
    }

    leaveRoom(roomName: string) {
        this.socketService.send('leaveRoomOther', roomName);
        this.room.roomInfo.name = '';
        this.isInRoom = false;
        this.isRejected = true;
    }

    validateName(room: Room): boolean {
        return this.pseudoIsDifferentFromAdversary(room) && this.isPseudoLengthValid();
    }

    get roomsWithMyGameType(): Room[] {
        return this.availableRooms.filter((room) => room.roomInfo.gameType === this.room.roomInfo.gameType);
    }

    get hasValidName(): boolean {
        return this.pseudo.length >= MIN_LENGTH_PSEUDO && this.pseudo.length <= MAX_LENGTH_PSEUDO;
    }

    websiteHasAvailableRooms(): boolean {
        return this.availableRooms && this.availableRooms.length > 0;
    }
    private pseudoIsDifferentFromAdversary(room: Room): boolean {
        return room.players[0].pseudo !== this.pseudo;
    }
    private isPseudoLengthValid(): boolean {
        return this.pseudo.length >= MIN_LENGTH_PSEUDO && this.pseudo.length <= MAX_LENGTH_PSEUDO;
    }
    private connect() {
        if (this.socketService.isSocketAlive()) {
            this.socketService.disconnect();
        }
        this.socketService.connect();
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('playerAccepted', (roomCreator: Room) => {
            sessionStorage.removeItem('data');
            this.setRoomServerToThisRoom(roomCreator);
            this.room.currentPlayerPseudo = this.pseudo;
            this.router.navigate(['/game']);
        });

        this.socketService.on('playerRejected', (roomCreator: Room) => {
            this.leaveRoom(roomCreator.roomInfo.name);
        });

        this.socketService.on('updateAvailableRoom', (rooms: Room[]) => {
            this.availableRooms = rooms;
        });
    }

    private canJoinCreatorRoom(room: Room): boolean {
        if (!room || room?.players.length > 1 || room.players.length === 0) {
            this.canJoinRoom = false;
            this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
            return false;
        }

        if (!this.validateName(room)) {
            this.isPseudoValid = false;
            return false;
        }

        this.canJoinRoom = true;
        return true;
    }

    private setRoomServerToThisRoom(roomServer: Room) {
        this.room.roomInfo.name = roomServer.roomInfo.name;
        this.room.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.room.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.room.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.room.players = roomServer.players;
    }
}
