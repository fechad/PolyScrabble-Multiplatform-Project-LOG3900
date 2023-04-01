import { DiscussionChannel } from '@app/classes/discussion-channel';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';

export class SocketChannelService extends SocketHandlerService {
    handleCreateChannel(socket: io.Socket, channelName: string, creator: Account, isRoomChannel?: boolean) {
        if (!channelName) return;
        const addedChannel = this.discussionChannelService.addChannel(channelName, creator, isRoomChannel);
        this.handleJoinChannel(socket, channelName, creator.username, isRoomChannel);
        if (!isRoomChannel) {
            this.sendToEveryone(SocketEvent.AvailableChannels, this.discussionChannelService.availableChannels);
            return;
        }

        this.sendToEveryoneInRoom(channelName, SocketEvent.RoomChannelUpdated, addedChannel);
    }

    handleJoinChannel(socket: io.Socket, channelName: string, username: string, isRoomChannel?: boolean) {
        if (!channelName) return;
        this.discussionChannelService.joinChannel(socket.id, channelName, username);
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

    handleChannelDisconnecting(socket: io.Socket, userDiscussionChannels?: DiscussionChannel[]) {
        const discussionChannels = userDiscussionChannels || this.getSocketDiscussionChannels(socket);
        if (discussionChannels.length <= 0) return;

        let username = '';
        for (const discussionChannel of discussionChannels) {
            const wantedUser = discussionChannel.activeUsers.find((user) => user.socketId === socket.id);
            if (!wantedUser) continue;
            username = wantedUser.username;
            break;
        }

        for (const discussionChannel of discussionChannels) {
            this.handleLeaveChannel(socket, discussionChannel.name, username);
        }
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
