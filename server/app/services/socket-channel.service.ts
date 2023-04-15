import { DiscussionChannel } from '@app/classes/discussion-channel';
import { GENERAL_CHAT_NAME } from '@app/constants/constants';
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
        const joinMessage = this.discussionChannelService.joinChannel(socket.id, channelName, username);
        const discussionChannel = this.discussionChannelService.getDiscussionChannel(channelName);
        this.socketJoin(socket, channelName);
        if (isRoomChannel) this.socketEmit(socket, SocketEvent.RoomChannelUpdated, discussionChannel);
        if (joinMessage) {
            this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, joinMessage);
            if (discussionChannel?.name === GENERAL_CHAT_NAME) return;
            this.socketEmit(socket, SocketEvent.UpdateDiscussionChannel, discussionChannel);
        }
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
        const leaveMessage = this.discussionChannelService.leaveChannel(channelName, username);
        this.socketLeaveRoom(socket, channelName);
        if (leaveMessage) this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, leaveMessage);
    }

    handleChatChannelMessage(channelName: string, message: ChannelMessage) {
        const messageAdded = this.discussionChannelService.addChannelMessage(channelName, message);
        if (messageAdded) this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, message);
    }

    handleGetDiscussionChannels(socket: io.Socket) {
        const channels = this.discussionChannelService.availableChannels;
        socket.emit(SocketEvent.AvailableChannels, channels);
    }
}
