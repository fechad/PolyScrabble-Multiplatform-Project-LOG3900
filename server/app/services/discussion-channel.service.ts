import { DiscussionChannel } from '@app/classes/discussion-channel';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Service } from 'typedi';

@Service()
export class DiscussionChannelService {
    availableChannels: DiscussionChannel[];

    constructor() {
        this.availableChannels = [
            new DiscussionChannel('General Chat'),
            new DiscussionChannel('Chilling Chat'),
            new DiscussionChannel('Meme Chat'),
            new DiscussionChannel('Share your creation'),
        ];
        this.availableChannels[0].addMessage({
            channelName: 'General Chat',
            system: true,
            time: new Date().toLocaleTimeString([], { hour12: false }),
            message: 'Welcome to PolyScrabble!',
        } as ChannelMessage);
    }

    getDiscussionChannel(channelName: string): DiscussionChannel | undefined {
        return this.availableChannels.find((channel: DiscussionChannel) => channel.name === channelName);
    }

    addChannel(name: string, owner: Account): boolean {
        this.availableChannels.push(new DiscussionChannel(name, owner));
        return true;
    }

    deleteChannel(name: string): boolean {
        this.availableChannels = this.availableChannels.filter((channel) => channel.name !== name);
        return true;
    }

    joinChannel(channelName: string, username: string): ChannelMessage | undefined {
        const channelToJoin = this.availableChannels.find((channel) => channel.name === channelName);
        return channelToJoin?.joinChannel(username);
    }

    leaveChannel(channelName: string, username: string): ChannelMessage | undefined {
        const channelToLeave = this.availableChannels.find((channel) => channel.name === channelName);
        return channelToLeave?.leaveChannel(username);
    }

    creatorLeaveChannel(channelName: string): DiscussionChannel[] {
        const channelToLeave = this.availableChannels.find((channel) => channel.name === channelName);
        if (channelToLeave) this.deleteChannel(channelToLeave.name);
        return this.availableChannels;
    }

    addChannelMessage(channelName: string, message: ChannelMessage): boolean {
        const channelToUpdate = this.availableChannels.find((channel) => channel.name === channelName);
        if (channelToUpdate) {
            channelToUpdate.addMessage(message);
            return true;
        }
        return false;
    }
}
