/* eslint-disable no-console */
import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { SocketEvent } from '@app/enums/socket-event';
import { Account } from '@app/interfaces/firestoreDB/account';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
import { ObserveRoomForm } from '@app/interfaces/observe-room-form';
import { PlayerData } from '@app/interfaces/player-data';
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
            console.log(socket.id, socket.eventNames());
            socket.on(SocketEvent.Disconnection, async () => {
                console.log('SocketEvent.Disconnection', socket.id);
                const userDiscussionChannels = this.socketHandlerService.getSocketDiscussionChannels(socket);
                await this.socketGameService.handleDisconnecting(socket);
                this.socketChannelService.handleChannelDisconnecting(socket, userDiscussionChannels);
            });

            socket.on(SocketEvent.LogOut, async () => {
                console.log('SocketEvent.LogOut', socket.id);

                const userDiscussionChannels = this.socketHandlerService.getSocketDiscussionChannels(socket);
                this.socketGameService.handleLeaveGame(socket);
                this.socketChannelService.handleChannelDisconnecting(socket, userDiscussionChannels);
                socket.disconnect();
            });

            socket.on(SocketEvent.Reconnect, (playerData: PlayerData) => {
                console.log('SocketEvent.Reconnect', socket.id);

                this.socketHandlerService.handleReconnect(socket, playerData);
            });

            socket.on(SocketEvent.ChatWindowSocket, () => {
                console.log('SocketEvent.ChatWindowSocket', socket.id);

                this.socketHandlerService.handleChatWindowSocket(socket);
            });

            socket.on(SocketEvent.GetPlayerInfos, (roomName: string) => {
                console.log('SocketEvent.GetPlayerInfos', socket.id);

                this.socketGameService.handleGetPlayerInfo(socket, roomName);
            });

            socket.on(SocketEvent.GetRackInfos, (roomName: string) => {
                console.log('SocketEvent.GetRackInfos', socket.id);

                this.socketGameService.handleGetRackInfo(socket, roomName);
            });

            socket.on(SocketEvent.GetPlayersRackInfos, (roomName: string) => {
                console.log('SocketEvent.GetPlayersRackInfos', socket.id);

                this.socketGameService.handleGetPlayersRackInfo(socket, roomName);
            });

            socket.on(SocketEvent.CreateRoom, (room: Room) => {
                console.log('SocketEvent.CreateRoom', socket.id);

                this.socketRoomService.handleCreateRoom(socket, room);
            });

            socket.on(SocketEvent.CreateChatChannel, (data: { channel: string; username: Account; isRoomChannel?: boolean }) => {
                console.log('SocketEvent.CreateChatChannel', socket.id);

                this.socketChannelService.handleCreateChannel(socket, data.channel, data.username, data.isRoomChannel);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.JoinChatChannel, (data: any) => {
                console.log('SocketEvent.JoinChatChannel', socket.id);

                this.socketChannelService.handleJoinChannel(socket, data.name, data.user, data.isRoomChannel);
            });

            socket.on(SocketEvent.LeaveChatChannel, (data: { channel: string; username: string }) => {
                console.log('SocketEvent.LeaveChatChannel', socket.id);

                this.socketChannelService.handleLeaveChannel(socket, data.channel, data.username);
            });

            socket.on(SocketEvent.CreatorLeaveChatChannel, (data: { channel: string; isRoomChannel: boolean }) => {
                console.log('SocketEvent.CreatorLeaveChatChannel', socket.id);

                this.socketChannelService.handleLeaveChannelCreator(socket, data.channel, data.isRoomChannel);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.on(SocketEvent.ChatChannelMessage, (data: any) => {
                console.log('SocketEvent.ChatChannelMessage', socket.id);

                this.socketChannelService.handleChatChannelMessage(data.channelName, data);
            });

            socket.on(SocketEvent.GetDiscussionChannels, () => {
                console.log('SocketEvent.GetDiscussionChannels', socket.id);

                this.socketChannelService.handleGetDiscussionChannels(socket);
            });

            socket.on(SocketEvent.CreateSoloRoom, (data: { room: Room; botName: string; desiredLevel: string }) => {
                console.log('SocketEvent.CreateSoloRoom', socket.id);

                this.socketRoomService.handleCreateSoloRoom(socket, data);
            });

            socket.on(SocketEvent.LeaveRoomCreator, (roomName: string) => {
                console.log('SocketEvent.LeaveRoomCreator', socket.id);

                this.socketRoomService.handleLeaveRoomCreator(socket, roomName);
                this.socketChannelService.handleLeaveChannelCreator(socket, roomName, true);
            });

            socket.on(SocketEvent.LeaveRoomOther, (roomName: string) => {
                console.log('SocketEvent.LeaveRoomOther', socket.id);

                const playerRemovedPseudo = this.socketRoomService.handleLeaveRoomOther(socket, roomName);
                if (!playerRemovedPseudo) return;
                this.socketChannelService.handleLeaveChannel(socket, roomName, playerRemovedPseudo);
            });

            socket.on(SocketEvent.LeaveGame, async () => {
                console.log('SocketEvent.LeaveGame', socket.id);

                this.socketGameService.handleLeaveGame(socket);
            });

            socket.on(SocketEvent.SetRoomAvailable, (roomName: string) => {
                console.log('SocketEvent.SetRoomAvailable', socket.id);

                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on(SocketEvent.JoinRoomRequest, (joinRoomForm: JoinRoomForm) => {
                console.log('SocketEvent.JoinRoomRequest', socket.id);

                this.socketRoomService.handleJoinRequest(socket, joinRoomForm);
            });

            socket.on(SocketEvent.ObserveRoomRequest, (observeRoomForm: ObserveRoomForm) => {
                console.log('SocketEvent.ObserveRoomRequest', socket.id);

                this.socketRoomService.handleObserveRoomRequest(socket, observeRoomForm);
            });

            socket.on(SocketEvent.AcceptPlayer, (data: { roomName: string; playerName: string }) => {
                console.log('SocketEvent.AcceptPlayer', socket.id);

                this.socketRoomService.handleAcceptPlayer(socket, data);
            });

            socket.on(SocketEvent.RejectPlayer, (data: { roomName: string; playerName: string }) => {
                console.log('SocketEvent.RejectPlayer', socket.id);

                this.socketRoomService.handleRejectPlayer(socket, data);
            });

            socket.on(SocketEvent.Message, (message: string) => {
                console.log('SocketEvent.Message', socket.id);

                this.socketGameService.handleMessage(socket, message);
            });

            socket.on(SocketEvent.AvailableRooms, () => {
                console.log('SocketEvent.AvailableRooms', socket.id);

                this.socketRoomService.handleAvailableRooms(socket);
            });

            socket.on(SocketEvent.PublicRooms, () => {
                console.log('SocketEvent.PublicRooms', socket.id);

                this.socketRoomService.handlePublicRooms(socket);
            });

            socket.on(SocketEvent.StartGameRequest, (roomName: string) => {
                console.log('SocketEvent.StartGameRequest', socket.id);

                this.socketGameService.handleStartGameRequest(socket, roomName);
            });

            socket.on(SocketEvent.StartGame, () => {
                console.log('SocketEvent.StartGame', socket.id);

                this.socketGameService.handleStartGame(socket);
            });

            socket.on(SocketEvent.ChangeTurn, (roomName: string) => {
                console.log('SocketEvent.ChangeTurn', socket.id);

                this.socketGameService.handleChangeTurn(socket, roomName);
            });

            socket.on(SocketEvent.GetAllGoals, () => {
                console.log('SocketEvent.GetAllGoals', socket.id);

                this.socketGameService.handleGetAllGoals(socket);
            });
        });
    }
}
