import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { DEFAULT_BOT_IMAGE } from '@app/constants/default-user-settings';
import { SocketEvent } from '@app/enums/socket-event';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-game-join-multiplayer-page',
    templateUrl: './game-join-multiplayer-page.component.html',
    styleUrls: ['./game-join-multiplayer-page.component.scss', '../dark-theme.scss'],
})
export class GameJoinMultiplayerPageComponent extends PageCommunicationManager implements OnInit {
    availableRooms: Room[];
    publicRooms: Room[];
    selectedRoom: Room;
    isPseudoValid: boolean;
    isInRoom: boolean;
    isRejected: boolean;
    canJoinRoom: boolean;
    invalidPasswordText: string;

    constructor(
        protected socketService: SocketClientService,
        private router: Router,
        public playerService: PlayerService,
        protected themeService: ThemeService,
    ) {
        super(socketService);
        this.isPseudoValid = true;
        this.canJoinRoom = true;
        this.isInRoom = false;
        this.isRejected = false;
        this.room.roomInfo.name = '';
        this.selectedRoom = new Room();
        this.availableRooms = [];
        this.publicRooms = [];
        this.invalidPasswordText = '';
    }

    get room(): Room {
        return this.playerService.room;
    }

    get botAvatarUrl(): string {
        return DEFAULT_BOT_IMAGE;
    }

    get isFrenchLanguage(): boolean {
        return this.playerService.account.userSettings.defaultLanguage === 'french';
    }

    get joinPopUpText(): string {
        if (this.isFrenchLanguage) {
            return this.playerService.isObserver ? 'Observer' : 'Joindre';
        }
        return this.playerService.isObserver ? 'Observe' : 'Join';
    }

    get roomsToShow(): Room[] {
        if (this.playerService.isObserver) {
            return this.publicRooms;
        }
        return this.availableRooms;
    }

    setInvalidPasswordText() {
        this.invalidPasswordText = this.isFrenchLanguage ? 'Votre mot de passe est invalide' : 'Your password is invalid';
    }

    ngOnInit() {
        this.connectSocket();
        this.updateRooms();
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
        if (!this.playerService.isObserver && !this.canJoinCreatorRoom(roomToUse)) return;
        if (roomToUse.roomInfo.isPublic && password !== roomToUse.roomInfo.password) {
            this.setInvalidPasswordText();
            return;
        }

        this.sendJoinRoomRequest(roomToUse, password);
    }

    askToJoinRoom(room: Room) {
        if (room.roomInfo.isPublic) return;
        if (!this.canJoinCreatorRoom(room)) return;

        this.sendJoinRoomRequest(room, '');
    }

    updateRooms() {
        this.socketService.send(SocketEvent.AvailableRooms);
        this.socketService.send(SocketEvent.PublicRooms);
    }

    leaveRoom(roomName: string) {
        this.socketService.send(SocketEvent.LeaveRoomOther, roomName);
        this.isInRoom = false;
        this.isRejected = true;
        this.room.reinitialize(this.room.roomInfo.gameType);
    }

    // TODO: remove duplicated code
    getFormattedTimerPerTurn(room: Room) {
        const timerPerTurn = parseInt(room.roomInfo.timerPerTurn, 10);
        const min = 60;
        const last = -2;
        return Math.floor(timerPerTurn / min).toString() + 'm' + ('0' + (timerPerTurn - Math.floor(timerPerTurn / min) * min).toString()).slice(last);
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.PlayerAccepted, (data: { serverRoom: Room; playerName: string }) => {
            if (data.playerName !== this.playerService.player.clientAccountInfo.username) return;
            sessionStorage.removeItem('data');
            this.room.setRoom(data.serverRoom);

            // TODO: remove currentPlayerPseudo. Obsolete
            this.room.currentPlayerPseudo = this.playerService.player.pseudo;
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: data.serverRoom.roomInfo.name,
                user: this.playerService.player.pseudo,
                isRoomChannel: true,
            });
            this.router.navigate(['/game/multiplayer/wait']);
        });

        this.socketService.on(SocketEvent.ObserverAccepted, (roomCreator: Room) => {
            sessionStorage.removeItem('data');
            this.room.setRoom(roomCreator);

            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: roomCreator.roomInfo.name,
                user: this.playerService.player.pseudo,
                isRoomChannel: true,
            });
            if (roomCreator.elapsedTime > 0) {
                this.router.navigate(['/game']);
                return;
            }
            this.router.navigate(['/game/multiplayer/wait']);
        });

        this.socketService.on(SocketEvent.PlayerRejected, (roomCreator: Room) => {
            this.leaveRoom(roomCreator.roomInfo.name);
        });

        this.socketService.on(SocketEvent.UpdateAvailableRoom, (rooms: Room[]) => {
            this.availableRooms = rooms;
        });

        this.socketService.on(SocketEvent.UpdatePublicRooms, (rooms: Room[]) => {
            this.publicRooms = rooms;
        });
    }

    private sendJoinRoomRequest(room: Room, password: string) {
        this.isRejected = false;

        this.isPseudoValid = true;
        this.isInRoom = true;
        // TODO: is this line really necessary? Remove it and see what happens
        this.availableRooms.splice(this.availableRooms.indexOf(room), 1);

        this.playerService.player.isCreator = false;
        this.playerService.player.socketId = this.socketService.socket.id;

        if (this.playerService.isObserver) {
            const observeRoomForm = {
                roomName: room.roomInfo.name,
                observer: { socketId: this.playerService.player.socketId, username: this.playerService.player.pseudo },
                password,
            };
            this.socketService.send(SocketEvent.ObserveRoomRequest, observeRoomForm);
            return;
        }

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
}
