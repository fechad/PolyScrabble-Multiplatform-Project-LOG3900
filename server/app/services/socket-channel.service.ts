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
    handleJoinChannel(socket: io.Socket, channelName: string, username: string) {
        if (!channelName) return;
        const message = this.discussionChannelService.joinChannel(channelName, username);
        this.socketJoin(socket, channelName);
        this.sendToEveryoneInRoom(socket.id, 'message', message);
    }

    handleLeaveChannelCreator(socket: io.Socket, channelName: string) {
        const availableChannels = this.discussionChannelService.creatorLeaveChannel(channelName);
        this.socketLeaveRoom(socket, channelName);
        this.sendToEveryone('updateAvailableChannels', availableChannels);
    }

    handleLeaveChannel(socket: io.Socket, channelName: string, username: string) {
        const message = this.discussionChannelService.leaveChannel(channelName, username);
        this.socketLeaveRoom(socket, channelName);
        this.socketEmitRoom(socket, channelName, 'message', message);
    }

    handleChatChannelMessage(socket: io.Socket, channelName: string, message: ChannelMessage) {
        const messageAdded = this.discussionChannelService.addChannelMessage(channelName, message);
        if (messageAdded) socket.broadcast.to(channelName).emit('channelMessage', message);
    }

    handleGetDiscussionChannels(socket: io.Socket) {
        const channels = this.discussionChannelService.availableChannels;
        socket.emit('availableChannels', channels);
    }
}
