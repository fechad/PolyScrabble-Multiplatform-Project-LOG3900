import { Player } from '@app/classes/player';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room-model/room';
import { GameLevel } from '@app/enums/game-level';
import { SocketEvent } from '@app/enums/socket-event';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
import { ObserveRoomForm } from '@app/interfaces/observe-room-form';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';

export class SocketRoomService extends SocketHandlerService {
    handleCreateSoloRoom(socket: io.Socket, data: { room: Room; botName: string; desiredLevel: string }) {
        if (!data.room) return;
        if (!data.room.roomInfo.isSolo) return;
        const availableRoom = this.roomService.createRoom(data.room);
        const desiredLevel = data.desiredLevel as GameLevel;
        availableRoom.botsLevel = desiredLevel;
        availableRoom.createVirtualPlayer(data.botName);
        this.roomService.setUnavailable(availableRoom.roomInfo.name);
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, SocketEvent.RoomCreated, availableRoom);
    }

    handleCreateRoom(socket: io.Socket, room: Room) {
        if (!room) return;

        const availableRoom = this.roomService.createRoom(room);
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, SocketEvent.RoomCreated, availableRoom);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
    }

    handleLeaveRoomCreator(socket: io.Socket, roomName: string) {
        if (!this.roomService.isRoomNameValid(roomName)) return;

        this.socketLeaveRoom(socket, roomName);
        this.roomService.removeRoom(roomName);
        this.sendToEveryoneInRoom(roomName, SocketEvent.RoomCreatorLeft);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
    }

    handleLeaveRoomOther(socket: io.Socket, roomName: string): string | undefined {
        if (!this.roomService.isRoomNameValid(roomName)) return;
        this.socketLeaveRoom(socket, roomName);

        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom) return;

        const observer = serverRoom.getObserver(socket.id);
        if (observer) {
            serverRoom.removeObserver(observer.username);
            this.sendToEveryoneInRoom(roomName, SocketEvent.ObserversUpdated, serverRoom.observers);
            this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
        }

        const player = serverRoom.getPlayer(socket.id);
        if (!player) return observer ? observer.username : undefined;
        serverRoom.removePlayer(player);
        this.socketEmitRoom(socket, roomName, SocketEvent.PlayerLeft, player);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        return player.pseudo;
    }

    handleSetRoomAvailable(socket: io.Socket, roomName: string) {
        this.roomService.setAvailable(roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleJoinRequest(socket: io.Socket, joinRoomForm: JoinRoomForm) {
        if (!joinRoomForm) return;
        const roomName = joinRoomForm.roomName;
        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom || !serverRoom.canAddPlayer(joinRoomForm.password)) return;
        const playerToAdd = joinRoomForm.player;

        serverRoom.addPlayer(
            new Player(playerToAdd.socketId, playerToAdd.pseudo, playerToAdd.isCreator, playerToAdd.clientAccountInfo),
            joinRoomForm.password,
        );

        if (serverRoom.players.length >= serverRoom.maxPlayers) this.roomService.setUnavailable(roomName);
        this.socketJoin(socket, roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());

        if (serverRoom.roomInfo.isPublic) {
            this.sendToEveryoneInRoom(roomName, SocketEvent.PlayerAccepted, { serverRoom, playerName: playerToAdd.clientAccountInfo.username });
            return;
        }

        const gameCreator = serverRoom.getPlayerByName(serverRoom.roomInfo.creatorName);
        if (!gameCreator) return;
        playerToAdd.rack = new Rack('');
        this.socketEmitRoom(socket, gameCreator.socketId, SocketEvent.PlayerFound, { room: serverRoom, player: playerToAdd });
    }

    handleObserveRoomRequest(socket: io.Socket, observeRoomForm: ObserveRoomForm) {
        if (!observeRoomForm) return;
        const roomName = observeRoomForm.roomName;
        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom || !serverRoom.canAddObserver(observeRoomForm)) return;
        serverRoom.addObserver(observeRoomForm);
        this.socketJoin(socket, roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
        this.socketEmit(socket, SocketEvent.ObserverAccepted, serverRoom);
        this.sendToEveryoneInRoom(roomName, SocketEvent.ObserversUpdated, serverRoom.observers);
    }

    handleAcceptPlayer(socket: io.Socket, data: { roomName: string; playerName: string }) {
        const serverRoom = this.roomService.getRoom(data.roomName);
        if (!serverRoom) return;
        const playerToAccept = serverRoom.getPlayerByName(data.playerName);
        if (!playerToAccept) return;
        this.sendToEveryoneInRoom(data.roomName, SocketEvent.PlayerAccepted, { serverRoom, playerName: playerToAccept.pseudo });
    }

    handleRejectPlayer(socket: io.Socket, data: { roomName: string; playerName: string }) {
        const serverRoom = this.roomService.getRoom(data.roomName);
        if (!serverRoom) return;
        const playerToReject = serverRoom.getPlayerByName(data.playerName);
        if (!playerToReject) return;

        this.socketEmitRoom(socket, playerToReject.socketId, SocketEvent.PlayerRejected, serverRoom);
    }

    handleAvailableRooms(socket: io.Socket) {
        this.sendToEveryoneInRoom(socket.id, SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handlePublicRooms(socket: io.Socket) {
        this.sendToEveryoneInRoom(socket.id, SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
    }
}
