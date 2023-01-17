import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { PlayerData } from '@app/interfaces/player-data';
import * as http from 'http';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketGameService } from './socket-game.service';
import { SocketHandlerService } from './socket-handler.service';
import { SocketRoomService } from './socket-room.service';

export class SocketManager {
    sio: io.Server;
    commandController: CommandController;
    private socketHandlerService: SocketHandlerService;
    private socketRoomService: SocketRoomService;
    private socketGameService: SocketGameService;
    private chatMessageService: ChatMessageService;
    constructor(server: http.Server, private scoresService: ScoresService, private gamesHistoryService: GamesHistoryService) {
        this.chatMessageService = new ChatMessageService();
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        const singleRoomService = new RoomService();
        const singleDateService = new DateService();

        this.socketHandlerService = new SocketHandlerService(
            this.sio,
            this.scoresService,
            gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketRoomService = new SocketRoomService(
            this.sio,
            this.scoresService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketGameService = new SocketGameService(
            this.sio,
            this.scoresService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );

        this.commandController = new CommandController(this.chatMessageService);
    }

    handleSockets() {
        this.sio.on('connection', (socket) => {
            socket.on('disconnecting', () => {
                this.socketHandlerService.handleDisconnecting(socket);
            });

            socket.on('reconnect', (playerData: PlayerData) => {
                this.socketHandlerService.handleReconnect(socket, playerData);
            });

            socket.on('getPlayerInfos', (roomName) => {
                this.socketGameService.handleGetPlayerInfo(socket, roomName);
            });

            socket.on('getRackInfos', (roomName) => {
                this.socketGameService.handleGetRackInfo(socket, roomName);
            });

            socket.on('joinRoom', (room: Room) => {
                this.socketRoomService.handleJoinRoom(socket, room);
            });

            socket.on('joinRoomSolo', (room: Room) => {
                this.socketRoomService.handleJoinRoomSolo(socket, room);
            });

            socket.on('joinRoomSoloBot', (data: { roomName: string; botName: string; isExpertLevel: boolean }) => {
                this.socketRoomService.handleJoinRoomSoloBot(socket, data);
            });

            socket.on('convertToRoomSoloBot', (data: { roomName: string; botName: string; points: number; isExpertLevel: boolean }) => {
                this.socketHandlerService.handleConvertToRoomSoloBot(socket, data);
                const room = this.socketRoomService.roomService.getRoom(data.roomName);
                this.socketGameService.handleChangeTurn(socket, room?.getCurrentPlayerTurn()?.pseudo as string);
                this.socketGameService.sendToEveryoneInRoom(data.roomName, 'playerTurnChanged', room?.getCurrentPlayerTurn()?.pseudo);
            });

            socket.on('leaveRoomCreator', (roomName: string) => {
                this.socketRoomService.handleLeaveRoomCreator(socket, roomName);
            });

            socket.on('leaveRoomOther', (roomName: string) => {
                this.socketRoomService.handleLeaveRoomOther(socket, roomName);
            });

            socket.on('setRoomAvailable', (roomName: string) => {
                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on('askToJoin', (room: Room) => {
                this.socketRoomService.handleAskToJoin(socket, room);
            });

            socket.on('acceptPlayer', (room: Room) => {
                this.socketRoomService.handleAcceptPlayer(socket, room);
            });

            socket.on('rejectPlayer', (room: Room) => {
                this.socketRoomService.handleRejectPlayer(socket, room);
            });

            socket.on('message', (message: string) => {
                this.socketGameService.handleMessage(socket, message);
            });

            socket.on('availableRooms', () => {
                this.socketRoomService.handleAvailableRooms(socket);
            });

            socket.on('startGame', () => {
                this.socketGameService.handleStartGame(socket);
            });

            socket.on('changeTurn', (roomName: string) => {
                this.socketGameService.handleChangeTurn(socket, roomName);
            });

            socket.on('botPlayAction', async () => {
                await this.socketGameService.handleBotPlayAction(socket);
            });

            socket.on('getAllGoals', () => {
                this.socketGameService.handleGetAllGoals(socket);
            });
        });
    }
}
