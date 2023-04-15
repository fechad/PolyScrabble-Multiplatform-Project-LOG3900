import { DiscussionChannel } from '@app/classes/discussion-channel';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';

@Service()
export class DiscussionChannelService {
    availableChannels: DiscussionChannel[];
    roomChannels: DiscussionChannel[];
    constructor() {
        this.availableChannels = [new DiscussionChannel('Principal')];
        this.roomChannels = [];
    }

    addChannel(channelName: string, owner: Account, isRoomChannel?: boolean): DiscussionChannel {
        const addedChannel = new DiscussionChannel(channelName, owner);
        if (isRoomChannel) {
            this.roomChannels.push(addedChannel);
            return addedChannel;
        }
        this.availableChannels.push(addedChannel);
        return addedChannel;
    }

    deleteChannel(name: string) {
        this.availableChannels = this.availableChannels.filter((channel) => channel.name !== name);
    }

    joinChannel(socketId: string, channelName: string, username: string): ChannelMessage | undefined {
        const channelToJoin = this.getDiscussionChannel(channelName);
        return channelToJoin?.joinChannel(socketId, username);
    }

    leaveChannel(channelName: string, username: string): ChannelMessage | undefined {
        const channelToLeave = this.getDiscussionChannel(channelName);
        return channelToLeave?.leaveChannel(username);
    }

    creatorLeaveChannel(channelName: string): DiscussionChannel[] {
        const channelToLeave = this.getDiscussionChannel(channelName);
        if (channelToLeave) this.deleteChannel(channelToLeave.name);
        return this.availableChannels;
    }

    addChannelMessage(channelName: string, message: ChannelMessage): boolean {
        const channelToUpdate = this.getDiscussionChannel(channelName);

        if (channelToUpdate) {
            message.time = new Date().toLocaleTimeString([], { hour12: false });
            channelToUpdate.addMessage(message);
            return true;
        }
        return false;
    }

    getDiscussionChannel(channelName: string): DiscussionChannel | undefined {
        return (
            this.availableChannels.find((channel) => channel.name === channelName) ||
            this.roomChannels.find((channel) => channel.name === channelName)
        );
    }

    updatePlayerAccount(account: ClientAccountInfo) {
        this.updatePlayerMessages(account);
    }

    getPlayerDiscussionChannels(playerEmail: string): DiscussionChannel[] {
        const userChannels = this.availableChannels.filter((channel) => channel.userSentMessage(playerEmail));
        const roomChannels = this.roomChannels.filter((channel) => channel.userSentMessage(playerEmail));
        const userDiscussionChannels = userChannels.concat(roomChannels);
        return userDiscussionChannels;
    }

    getPlayerActiveDiscussionChannels(playerUsername: string): DiscussionChannel[] {
        const userChannels = this.availableChannels.filter((channel) => channel.userExists(playerUsername));
        const roomChannels = this.roomChannels.filter((channel) => channel.userExists(playerUsername));
        const userDiscussionChannels = userChannels.concat(roomChannels);
        return userDiscussionChannels;
    }

    private updatePlayerMessages(account: ClientAccountInfo) {
        const discussionChannels = this.getPlayerDiscussionChannels(account.email);
        for (const discussionChannel of discussionChannels) {
            discussionChannel.updatePlayerAccount(account);
        }
        SocketManager.instance.socketHandlerService.sendToEveryone(SocketEvent.AvailableChannels, this.availableChannels);
    }
}
