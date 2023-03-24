import { DiscussionChannel } from '@app/classes/discussion-channel';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Service } from 'typedi';

@Service()
export class DiscussionChannelService {
    availableChannels: DiscussionChannel[];
    roomChannels: DiscussionChannel[];

    constructor() {
        this.availableChannels = [new DiscussionChannel('General Chat')];
        this.availableChannels[0].addMessage({
            channelName: 'General Chat',
            system: true,
            time: new Date().toLocaleTimeString([], { hour12: false }),
            message: 'Welcome to PolyScrabble!',
        } as ChannelMessage);

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

    joinChannel(channelName: string, username: string): ChannelMessage | undefined {
        const channelToJoin = this.getDiscussionChannel(channelName);
        return channelToJoin?.joinChannel(username);
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
}
