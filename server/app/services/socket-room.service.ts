import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { GameLevel } from '@app/enums/game-level';
import { SocketEvent } from '@app/enums/socket-event';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';

export class SocketRoomService extends SocketHandlerService {
    handleJoinRoomSolo(socket: io.Socket, room: Room) {
        if (!room) return;
        if (!room.roomInfo.isSolo) return;
        const availableRoom = this.roomService.createRoom(room);
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, SocketEvent.JoinRoomSoloStatus, availableRoom.roomInfo.name);
    }

    handleJoinRoomSoloBot(socket: io.Socket, data: { roomName: string; botName: string; isExpertLevel: boolean }) {
        if (!data.roomName) return;
        const room = this.roomService.getRoom(data.roomName);
        if (!room) return;
        const desiredLevel = !data.isExpertLevel ? GameLevel.Beginner : GameLevel.Expert;
        room.createPlayerVirtual(socket.id, data.botName, desiredLevel);
        this.socketJoin(socket, room.roomInfo.name);
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.BotInfos, room.bot);
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleJoinRoom(socket: io.Socket, room: Room) {
        if (!room) return;
        const availableRoom = this.roomService.createRoom(room);
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, SocketEvent.JoinRoomStatus, availableRoom.roomInfo.name);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleLeaveRoomCreator(socket: io.Socket, roomName: string) {
        if (!this.roomService.isRoomNameValid(roomName)) return;
        this.socketLeaveRoom(socket, roomName);
        this.roomService.removeRoom(roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleLeaveRoomOther(socket: io.Socket, roomName: string) {
        if (!this.roomService.isRoomNameValid(roomName)) return;
        this.socketLeaveRoom(socket, roomName);

        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom) return;
        const player = serverRoom.getPlayer(socket.id);
        if (!player) return;
        serverRoom.removePlayer(player);
        this.socketEmitRoom(socket, roomName, SocketEvent.PlayerLeft);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleSetRoomAvailable(socket: io.Socket, roomName: string) {
        this.roomService.setAvailable(roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }

    handleAskToJoin(socket: io.Socket, room: Room) {
        if (!room) return;
        const roomName = room.roomInfo.name;
        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom) return;
        this.roomService.setUnavailable(roomName);

        const indexOfPlayer = room.players.length - 1;
        const playerToAdd = room.players[indexOfPlayer];
        serverRoom.addPlayer(new Player(playerToAdd.socketId, playerToAdd.pseudo, playerToAdd.isCreator));
        this.socketJoin(socket, roomName);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());

        this.socketEmitRoom(socket, roomName, SocketEvent.PlayerFound, serverRoom);
    }

    handleAcceptPlayer(socket: io.Socket, room: Room) {
        if (!room) return;
        if (!this.roomService.isRoomNameValid(room.roomInfo.name)) return;
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.PlayerAccepted, room);
    }

    handleRejectPlayer(socket: io.Socket, room: Room) {
        if (!room) return;
        if (!this.roomService.isRoomNameValid(room.roomInfo.name)) return;
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.PlayerRejected, room);
    }

    handleAvailableRooms(socket: io.Socket) {
        this.sendToEveryoneInRoom(socket.id, SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
    }
}
