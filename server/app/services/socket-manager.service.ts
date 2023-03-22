import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { SocketEvent } from '@app/enums/socket-event';
import { Account } from '@app/interfaces/firestoreDB/account';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
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
            this.discussionChannelService,
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
            socket.on(SocketEvent.Disconnection, async () => {
                await this.socketHandlerService.handleDisconnecting(socket);
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

            socket.on(SocketEvent.CreateRoom, (room: Room) => {
                this.socketRoomService.handleCreateRoom(socket, room);
            });

            socket.on(SocketEvent.CreateChatChannel, (data: { channel: string; username: Account; isRoomChannel?: boolean }) => {
                this.socketChannelService.handleCreateChannel(data.channel, data.username, data.isRoomChannel);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.JoinChatChannel, (data: any) => {
                this.socketChannelService.handleJoinChannel(socket, data.name, data.user, data.isRoomChannel);
            });

            socket.on(SocketEvent.LeaveChatChannel, (data: { channel: string; username: string }) => {
                this.socketChannelService.handleLeaveChannel(socket, data.channel, data.username);
            });

            socket.on(SocketEvent.CreatorLeaveChatChannel, (data: { channel: string; isRoomChannel: boolean }) => {
                this.socketChannelService.handleLeaveChannelCreator(socket, data.channel, data.isRoomChannel);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.ChatChannelMessage, (data: any) => {
                this.socketChannelService.handleChatChannelMessage(data.channelName, data);
            });

            socket.on(SocketEvent.GetDiscussionChannels, () => {
                this.socketChannelService.handleGetDiscussionChannels(socket);
            });

            socket.on(SocketEvent.CreateSoloRoom, (data: { room: Room; botName: string; desiredLevel: string }) => {
                this.socketRoomService.handleCreateSoloRoom(socket, data);
            });

            socket.on(SocketEvent.LeaveRoomCreator, (roomName: string) => {
                this.socketRoomService.handleLeaveRoomCreator(socket, roomName);
                this.socketChannelService.handleLeaveChannelCreator(socket, roomName, true);
            });

            socket.on(SocketEvent.LeaveRoomOther, (roomName: string) => {
                const playerRemoved = this.socketRoomService.handleLeaveRoomOther(socket, roomName);
                if (!playerRemoved) return;
                this.socketChannelService.handleLeaveChannel(socket, roomName, playerRemoved.pseudo);
            });

            socket.on(SocketEvent.LeaveGame, async () => {
                await this.socketGameService.handleLeaveGame(socket);
            });

            socket.on(SocketEvent.SetRoomAvailable, (roomName: string) => {
                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on(SocketEvent.JoinRoomRequest, (joinRoomForm: JoinRoomForm) => {
                this.socketRoomService.handleJoinRequest(socket, joinRoomForm);
            });

            socket.on(SocketEvent.AcceptPlayer, (data: { roomName: string; playerName: string }) => {
                this.socketRoomService.handleAcceptPlayer(socket, data);
            });

            socket.on(SocketEvent.RejectPlayer, (data: { roomName: string; playerName: string }) => {
                this.socketRoomService.handleRejectPlayer(socket, data);
            });

            socket.on(SocketEvent.Message, (message: string) => {
                this.socketGameService.handleMessage(socket, message);
            });

            socket.on(SocketEvent.AvailableRooms, () => {
                this.socketRoomService.handleAvailableRooms(socket);
            });

            socket.on(SocketEvent.StartGameRequest, (roomName: string) => {
                this.socketGameService.handleStartGameRequest(socket, roomName);
            });

            socket.on(SocketEvent.StartGame, () => {
                this.socketGameService.handleStartGame(socket);
            });

            socket.on(SocketEvent.ChangeTurn, (roomName: string) => {
                this.socketGameService.handleChangeTurn(socket, roomName);
            });

            socket.on(SocketEvent.GetAllGoals, () => {
                this.socketGameService.handleGetAllGoals(socket);
            });
        });
    }
}
