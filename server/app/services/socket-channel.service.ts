import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketHandlerService } from './socket-handler.service';

export class SocketChannelService extends SocketHandlerService {
    constructor(
        public discussionChannelService: DiscussionChannelService,
        public sio: io.Server,
        scoreService: ScoresService,
        gamesHistoryService: GamesHistoryService,
        playerGameHistoryService: PlayerGameHistoryService,
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
    ) {
        super(sio, scoreService, playerGameHistoryService, gamesHistoryService, chatMessageService, roomService, dateService);
    }

    handleCreateChannel(channelName: string, creator: Account, isRoomChannel?: boolean) {
        if (!channelName) return;
        const addedChannel = this.discussionChannelService.addChannel(channelName, creator, isRoomChannel);
        if (!isRoomChannel) {
            this.sendToEveryone(SocketEvent.AvailableChannels, this.discussionChannelService.availableChannels);
            return;
        }
        this.sendToEveryoneInRoom(channelName, SocketEvent.RoomChannelUpdated, addedChannel);
    }

    handleJoinChannel(socket: io.Socket, channelName: string, username: string, isRoomChannel: boolean) {
        if (!channelName) return;
        this.discussionChannelService.joinChannel(channelName, username);
        this.socketJoin(socket, channelName);
        if (isRoomChannel) this.socketEmit(socket, SocketEvent.RoomChannelUpdated, this.discussionChannelService.getDiscussionChannel(channelName));

        const channelMessages = this.discussionChannelService.getDiscussionChannel(channelName)?.messages;
        this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, channelMessages);
    }

    handleLeaveChannelCreator(socket: io.Socket, channelName: string, isRoomChannel: boolean) {
        const availableChannels = this.discussionChannelService.creatorLeaveChannel(channelName);
        this.socketLeaveRoom(socket, channelName);

        if (isRoomChannel) this.sendToEveryoneInRoom(channelName, SocketEvent.RoomChannelUpdated, null);
        else this.sendToEveryone(SocketEvent.AvailableChannels, availableChannels);
    }

    handleLeaveChannel(socket: io.Socket, channelName: string, username: string) {
        this.discussionChannelService.leaveChannel(channelName, username);
        this.socketLeaveRoom(socket, channelName);
        const channelMessages = this.discussionChannelService.getDiscussionChannel(channelName)?.messages;
        this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, channelMessages);
    }

    handleChatChannelMessage(channelName: string, message: ChannelMessage) {
        const messageAdded = this.discussionChannelService.addChannelMessage(channelName, message);
        if (messageAdded) {
            const channelMessages = this.discussionChannelService.getDiscussionChannel(channelName)?.messages;
            this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, channelMessages);
        }
    }

    handleGetDiscussionChannels(socket: io.Socket) {
        const channels = this.discussionChannelService.availableChannels;
        socket.emit(SocketEvent.AvailableChannels, channels);
    }
}
