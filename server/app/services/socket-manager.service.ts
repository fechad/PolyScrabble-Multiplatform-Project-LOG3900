import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { SocketEvent } from '@app/enums/socket-event';
import { Account } from '@app/interfaces/firestoreDB/account';
import { PlayerData } from '@app/interfaces/player-data';
import * as http from 'http';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketChannelService } from './socket-channel.service';
import { SocketGameService } from './socket-game.service';
import { SocketHandlerService } from './socket-handler.service';
import { SocketRoomService } from './socket-room.service';

export class SocketManager {
    sio: io.Server;
    commandController: CommandController;
    private socketHandlerService: SocketHandlerService;
    private socketRoomService: SocketRoomService;
    private socketChannelService: SocketChannelService;
    private socketGameService: SocketGameService;
    private chatMessageService: ChatMessageService;
    private discussionChannelService: DiscussionChannelService;
    constructor(
        server: http.Server,
        private scoresService: ScoresService,
        private playerGameHistoryService: PlayerGameHistoryService,
        private gamesHistoryService: GamesHistoryService,
    ) {
        this.chatMessageService = new ChatMessageService();
        this.discussionChannelService = new DiscussionChannelService();
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        const singleRoomService = new RoomService();
        const singleDateService = new DateService();

        this.socketHandlerService = new SocketHandlerService(
            this.sio,
            this.scoresService,
            this.playerGameHistoryService,
            gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketRoomService = new SocketRoomService(
            this.sio,
            this.scoresService,
            this.playerGameHistoryService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketGameService = new SocketGameService(
            this.sio,
            this.scoresService,
            this.playerGameHistoryService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketChannelService = new SocketChannelService(
            this.discussionChannelService,
            this.sio,
            this.scoresService,
            this.gamesHistoryService,
            this.playerGameHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.commandController = new CommandController(this.chatMessageService);
    }

    handleSockets() {
        this.sio.on(SocketEvent.Connection, (socket) => {
            socket.on(SocketEvent.Disconnection, () => {
                this.socketHandlerService.handleDisconnecting(socket);
            });

            socket.on(SocketEvent.Reconnect, (playerData: PlayerData) => {
                this.socketHandlerService.handleReconnect(socket, playerData);
            });

            socket.on(SocketEvent.GetPlayerInfos, (roomName: string) => {
                this.socketGameService.handleGetPlayerInfo(socket, roomName);
            });

            socket.on(SocketEvent.GetRackInfos, (roomName: string) => {
                this.socketGameService.handleGetRackInfo(socket, roomName);
            });

            socket.on(SocketEvent.JoinRoom, (room: Room) => {
                this.socketRoomService.handleJoinRoom(socket, room);
            });

            socket.on(SocketEvent.CreateChatChannel, (channel: string, username: Account) => {
                this.socketChannelService.handleCreateChannel(channel, username);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.JoinChatChannel, (data: any) => {
                this.socketChannelService.handleJoinChannel(socket, data.name, data.user);
            });

            socket.on(SocketEvent.LeaveChatChannel, (data: { channel: string; username: string }) => {
                this.socketChannelService.handleLeaveChannel(socket, data.channel, data.username);
            });

            socket.on(SocketEvent.CreatorLeaveChatChannel, (channel: string) => {
                this.socketChannelService.handleLeaveChannelCreator(socket, channel);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.ChatChannelMessage, (data: any) => {
                this.socketChannelService.handleChatChannelMessage(data.channelName, data);
            });

            socket.on(SocketEvent.GetDiscussionChannels, () => {
                this.socketChannelService.handleGetDiscussionChannels(socket);
            });

            socket.on(SocketEvent.JoinRoomSolo, (room: Room) => {
                this.socketRoomService.handleJoinRoomSolo(socket, room);
            });

            socket.on(SocketEvent.JoinRoomSoloBot, (data: { roomName: string; botName: string; isExpertLevel: boolean }) => {
                this.socketRoomService.handleJoinRoomSoloBot(socket, data);
            });

            socket.on(SocketEvent.ConvertToRoomSoloBot, (data: { roomName: string; botName: string; points: number; isExpertLevel: boolean }) => {
                this.socketHandlerService.handleConvertToRoomSoloBot(socket, data);
                const room = this.socketRoomService.roomService.getRoom(data.roomName);
                this.socketGameService.handleChangeTurn(socket, room?.getCurrentPlayerTurn()?.pseudo as string);
                this.socketGameService.sendToEveryoneInRoom(data.roomName, 'playerTurnChanged', room?.getCurrentPlayerTurn()?.pseudo);
            });

            socket.on(SocketEvent.LeaveRoomCreator, (roomName: string) => {
                this.socketRoomService.handleLeaveRoomCreator(socket, roomName);
            });

            socket.on(SocketEvent.LeaveRoomOther, (roomName: string) => {
                this.socketRoomService.handleLeaveRoomOther(socket, roomName);
            });

            socket.on(SocketEvent.SetRoomAvailable, (roomName: string) => {
                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on(SocketEvent.AskToJoin, (room: Room) => {
                this.socketRoomService.handleAskToJoin(socket, room);
            });

            socket.on(SocketEvent.AcceptPlayer, (room: Room) => {
                this.socketRoomService.handleAcceptPlayer(socket, room);
            });

            socket.on(SocketEvent.RejectPlayer, (room: Room) => {
                this.socketRoomService.handleRejectPlayer(socket, room);
            });

            socket.on(SocketEvent.Message, (message: string) => {
                this.socketGameService.handleMessage(socket, message);
            });

            socket.on(SocketEvent.AvailableRooms, () => {
                this.socketRoomService.handleAvailableRooms(socket);
            });

            socket.on(SocketEvent.StartGame, () => {
                this.socketGameService.handleStartGame(socket);
            });

            socket.on(SocketEvent.ChangeTurn, (roomName: string) => {
                this.socketGameService.handleChangeTurn(socket, roomName);
            });

            socket.on(SocketEvent.BotPlayAction, async () => {
                await this.socketGameService.handleBotPlayAction(socket);
            });

            socket.on(SocketEvent.GetAllGoals, () => {
                this.socketGameService.handleGetAllGoals(socket);
            });
        });
    }
}
