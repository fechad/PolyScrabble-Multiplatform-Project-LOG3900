/* eslint-disable no-console */
import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { SocketEvent } from '@app/enums/socket-event';
import { Account } from '@app/interfaces/firestoreDB/account';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
import { ObserveRoomForm } from '@app/interfaces/observe-room-form';
import { PlayerData } from '@app/interfaces/player-data';
import { Position } from '@app/interfaces/position';
import * as http from 'http';
import * as io from 'socket.io';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketChannelService } from './socket-channel.service';
import { SocketGameService } from './socket-game.service';
import { SocketHandlerService } from './socket-handler.service';
import { SocketRoomService } from './socket-room.service';

export class SocketManager {
    private static staticInstance: SocketManager;

    sio: io.Server;
    commandController: CommandController;
    socketHandlerService: SocketHandlerService;
    socketRoomService: SocketRoomService;
    socketChannelService: SocketChannelService;
    socketGameService: SocketGameService;
    chatMessageService: ChatMessageService;
    discussionChannelService: DiscussionChannelService;
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
            this.discussionChannelService,
            this.sio,
            this.scoresService,
            this.playerGameHistoryService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.socketRoomService = new SocketRoomService(
            this.discussionChannelService,
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
            this.playerGameHistoryService,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
        );
        this.commandController = new CommandController(this.chatMessageService);
    }

    // Must createInstance before getting it
    static get instance() {
        return this.staticInstance;
    }

    static createInstance(
        server: http.Server,
        scoresService: ScoresService,
        playerGameHistoryService: PlayerGameHistoryService,
        gamesHistoryService: GamesHistoryService,
    ) {
        this.staticInstance = new SocketManager(server, scoresService, playerGameHistoryService, gamesHistoryService);
    }

    handleSockets() {
        this.sio.on(SocketEvent.Connection, (socket) => {
            socket.on(SocketEvent.Disconnection, async () => {
                const userDiscussionChannels = this.socketHandlerService.getSocketDiscussionChannels(socket);
                await this.socketGameService.handleDisconnecting(socket);
                this.socketChannelService.handleChannelDisconnecting(socket, userDiscussionChannels);
            });

            socket.on(SocketEvent.LogOut, async () => {
                const userDiscussionChannels = this.socketHandlerService.getSocketDiscussionChannels(socket);
                this.socketGameService.handleLeaveGame(socket);
                this.socketChannelService.handleChannelDisconnecting(socket, userDiscussionChannels);
                socket.disconnect();
            });

            socket.on(SocketEvent.Reconnect, (playerData: PlayerData) => {
                this.socketHandlerService.handleReconnect(socket, playerData);
            });

            socket.on(SocketEvent.ChatWindowSocket, () => {
                this.socketHandlerService.handleChatWindowSocket(socket);
            });

            socket.on(SocketEvent.GetPlayerInfos, (roomName: string) => {
                this.socketGameService.handleGetPlayerInfo(socket, roomName);
            });

            socket.on(SocketEvent.GetRackInfos, (roomName: string) => {
                this.socketGameService.handleGetRackInfo(socket, roomName);
            });

            socket.on(SocketEvent.GetPlayersRackInfos, (roomName: string) => {
                this.socketGameService.handleGetPlayersRackInfo(socket, roomName);
            });

            socket.on(SocketEvent.FirstTilePlaced, (tileIndexes: Position | null) => {
                this.socketGameService.handleFirstTilePlaced(socket, tileIndexes);
            });

            socket.on(SocketEvent.CreateRoom, (room: Room) => {
                this.socketRoomService.handleCreateRoom(socket, room);
            });

            socket.on(SocketEvent.CreateChatChannel, (data: { channel: string; username: Account; isRoomChannel?: boolean }) => {
                this.socketChannelService.handleCreateChannel(socket, data.channel, data.username, data.isRoomChannel);
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
                if (typeof data.account.badges === 'string') data.account.badges = JSON.parse(data.account.badges);
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
                const playerRemovedPseudo = this.socketRoomService.handleLeaveRoomOther(socket, roomName);
                if (!playerRemovedPseudo) return;
                this.socketChannelService.handleLeaveChannel(socket, roomName, playerRemovedPseudo);
            });

            socket.on(SocketEvent.LeaveGame, async () => {
                this.socketGameService.handleLeaveGame(socket);
            });

            socket.on(SocketEvent.SetRoomAvailable, (roomName: string) => {
                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on(SocketEvent.JoinRoomRequest, (joinRoomForm: JoinRoomForm) => {
                this.socketRoomService.handleJoinRequest(socket, joinRoomForm);
            });

            socket.on(SocketEvent.ObserveRoomRequest, (observeRoomForm: ObserveRoomForm) => {
                this.socketRoomService.handleObserveRoomRequest(socket, observeRoomForm);
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

            socket.on(SocketEvent.PublicRooms, () => {
                this.socketRoomService.handlePublicRooms(socket);
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
