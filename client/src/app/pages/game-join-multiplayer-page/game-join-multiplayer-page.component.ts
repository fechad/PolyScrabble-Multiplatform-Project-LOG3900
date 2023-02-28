import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '@app/classes/room';
import { GAME_REJECTION_BY_ADVERSARY, INVALID_PSEUDO, ROOM_ERROR, WAITING_FOR_CONFIRMATION } from '@app/constants/status-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-join-multiplayer-page',
    templateUrl: './game-join-multiplayer-page.component.html',
    styleUrls: ['./game-join-multiplayer-page.component.scss', '../dark-theme.scss'],
})
export class GameJoinMultiplayerPageComponent implements OnInit {
    availableRooms: Room[];
    selectedRoom: Room;
    isPseudoValid: boolean;
    isInRoom: boolean;
    isRejected: boolean;
    canJoinRoom: boolean;

    constructor(private socketService: SocketClientService, private router: Router, public room: Room, public playerService: PlayerService) {
        this.isPseudoValid = true;
        this.canJoinRoom = true;
        this.isInRoom = false;
        this.isRejected = false;
        this.room.roomInfo.name = '';
        this.selectedRoom = new Room();
        this.availableRooms = [];
    }

    get roomStatusText(): string {
        if (this.isInRoom) return WAITING_FOR_CONFIRMATION;
        if (this.isRejected) return GAME_REJECTION_BY_ADVERSARY;
        if (!this.isPseudoValid) return INVALID_PSEUDO;
        if (!this.canJoinRoom) return ROOM_ERROR;
        return '';
    }

    get roomsWithMyGameType(): Room[] {
        return this.availableRooms.filter((room) => room.roomInfo.gameType === this.room.roomInfo.gameType);
    }

    ngOnInit() {
        this.connect();
        this.getAvailableRooms();
    }

    isRoomStatusTextEmpty(): boolean {
        return this.roomStatusText === '';
    }

    openPasswordPopup(availableRoom: Room, roomPopup: HTMLDivElement, darkBackground: HTMLDivElement) {
        this.selectedRoom = availableRoom;
        roomPopup.classList.add('show');
        darkBackground.classList.add('show');
    }

    closePasswordPopup(roomPopup: HTMLDivElement, darkBackground: HTMLDivElement) {
        roomPopup.classList.remove('show');
        darkBackground.classList.remove('show');
    }

    joinRoom(password: string, room?: Room) {
        const roomToUse = room || this.selectedRoom;
        if (!this.canJoinCreatorRoom(roomToUse)) return;
        if (roomToUse.roomInfo.isPublic && password !== roomToUse.roomInfo.password) return;

        this.sendJoinRoomRequest(roomToUse, password);
    }

    askToJoinRoom(room: Room) {
        if (room.roomInfo.isPublic) return;
        if (!this.canJoinCreatorRoom(room)) return;

        this.sendJoinRoomRequest(room, '');
    }

    getAvailableRooms() {
        this.socketService.send(SocketEvent.AvailableRooms);
    }

    leaveRoom(roomName: string) {
        this.socketService.send(SocketEvent.LeaveRoomOther, roomName);
        this.room.roomInfo.name = '';
        this.isInRoom = false;
        this.isRejected = true;
        this.room.reinitialize(this.room.roomInfo.gameType);
    }

    websiteHasAvailableRooms(): boolean {
        return this.availableRooms && this.availableRooms.length > 0;
    }

    private connect() {
        this.socketService.refreshConnection();
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.PlayerAccepted, (roomCreator: Room) => {
            sessionStorage.removeItem('data');
            this.setRoomServerToThisRoom(roomCreator);
            // TODO: remove currentPlayerPseudo. Obsolete
            this.room.currentPlayerPseudo = this.playerService.player.pseudo;
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: roomCreator.roomInfo.name,
                user: this.playerService.player.pseudo,
            });
            this.router.navigate(['/game/multiplayer/wait']);
        });

        this.socketService.on(SocketEvent.PlayerRejected, (roomCreator: Room) => {
            this.leaveRoom(roomCreator.roomInfo.name);
        });

        this.socketService.on(SocketEvent.UpdateAvailableRoom, (rooms: Room[]) => {
            this.availableRooms = rooms;
        });
    }

    private sendJoinRoomRequest(room: Room, password: string) {
        this.isRejected = false;

        this.isPseudoValid = true;
        this.isInRoom = true;
        this.availableRooms.splice(this.availableRooms.indexOf(room), 1);

        this.playerService.player.isCreator = false;
        this.playerService.player.socketId = this.socketService.socket.id;

        const joinRoomForm = { roomName: room.roomInfo.name, player: this.playerService.player, password };
        this.socketService.send(SocketEvent.JoinRoomRequest, joinRoomForm);
    }

    private canJoinCreatorRoom(room: Room): boolean {
        if (!room || room?.players.length >= room?.roomInfo.maxPlayers || room.players.length === 0) {
            this.canJoinRoom = false;
            this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
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
