import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { GameLevel } from '@app/enums/game-level';
import { SocketEvent } from '@app/enums/socket-event';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
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
    }

    handleLeaveRoomCreator(socket: io.Socket, roomName: string) {
        if (!this.roomService.isRoomNameValid(roomName)) return;

        this.socketLeaveRoom(socket, roomName);
        this.roomService.removeRoom(roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleLeaveRoomOther(socket: io.Socket, roomName: string): Player | undefined {
        if (!this.roomService.isRoomNameValid(roomName)) return;
        this.socketLeaveRoom(socket, roomName);

        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom) return;
        const player = serverRoom.getPlayer(socket.id);
        if (!player) return;
        serverRoom.removePlayer(player);
        this.socketEmitRoom(socket, roomName, SocketEvent.PlayerLeft, player);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        return player;
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
            this.sendToEveryoneInRoom(roomName, SocketEvent.PlayerAccepted, serverRoom);
            return;
        }

        const gameCreator = serverRoom.getPlayerByName(serverRoom.roomInfo.creatorName);
        if (!gameCreator) return;

        this.socketEmitRoom(socket, gameCreator.socketId, SocketEvent.PlayerFound, { room: serverRoom, player: playerToAdd });
    }

    handleAcceptPlayer(socket: io.Socket, data: { roomName: string; playerName: string }) {
        const serverRoom = this.roomService.getRoom(data.roomName);
        if (!serverRoom) return;
        const playerToAccept = serverRoom.getPlayerByName(data.playerName);
        if (!playerToAccept) return;
        this.socketEmitRoom(socket, playerToAccept.socketId, SocketEvent.PlayerAccepted, serverRoom);
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
}
