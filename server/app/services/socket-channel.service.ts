import { Account } from '@app/interfaces/account';
import { ChannelMessage } from '@app/interfaces/channel-message';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
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
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
    ) {
        super(sio, scoreService, gamesHistoryService, chatMessageService, roomService, dateService);
    }

    handleCreateChannel(socket: io.Socket, channelName: string, creator: Account) {
        if (!channelName) return;
        const added = this.discussionChannelService.addChannel(channelName, creator);
        if (added) this.sendToEveryoneInRoom(socket.id, 'availableChannels', this.discussionChannelService.availableChannels);
    }

    handleJoinChannel(socket: io.Socket, channelName: string, username: string) {
        if (!channelName) return;
        const message = this.discussionChannelService.joinChannel(channelName, username);
        this.socketJoin(socket, channelName);
        this.sendToEveryoneInRoom(channelName, 'channelMessage', message);
    }

    handleLeaveChannelCreator(socket: io.Socket, channelName: string) {
        const availableChannels = this.discussionChannelService.creatorLeaveChannel(channelName);
        this.socketLeaveRoom(socket, channelName);
        this.sendToEveryone('availableChannels', availableChannels);
    }

    handleLeaveChannel(socket: io.Socket, channelName: string, username: string) {
        const message = this.discussionChannelService.leaveChannel(channelName, username);
        this.socketLeaveRoom(socket, channelName);
        this.socketEmitRoom(socket, channelName, 'channelMessage', message);
    }

    handleChatChannelMessage(channelName: string, message: ChannelMessage) {
        const messageAdded = this.discussionChannelService.addChannelMessage(channelName, message);
        if (messageAdded) this.sendToEveryoneInRoom(channelName, 'channelMessage', message);
    }

    handleGetDiscussionChannels(socket: io.Socket) {
        const channels = this.discussionChannelService.availableChannels;
        socket.emit('availableChannels', channels);
    }
}
