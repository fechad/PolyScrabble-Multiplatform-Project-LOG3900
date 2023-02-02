import { DiscussionChannel } from '@app/classes/discussion-channel';
import { Account } from '@app/interfaces/account';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { Service } from 'typedi';

@Service()
export class DiscussionChannelService {
    availableChannels: DiscussionChannel[];

    constructor() {
        this.availableChannels = [new DiscussionChannel('General Chat')];
        this.availableChannels[0].addMessage({
            system: true,
            time: new Date().toLocaleTimeString(),
            message: 'Welcome to PolyScrabble!',
        } as ChannelMessage);
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
