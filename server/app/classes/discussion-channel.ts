import { Account } from '@app/interfaces/account';
import { ChannelMessage } from '@app/interfaces/channel-message';

export class DiscussionChannel {
    name: string;
    owner?: Account;
    activeUsers: number;
    messages: ChannelMessage[];

    constructor(name: string, owner?: Account) {
        this.name = name;
        this.owner = owner;
        this.activeUsers = 1;
        this.messages = [];
    }

    addMessage(message: ChannelMessage) {
        this.messages.push(message);
    }

    joinChannel(username: string): ChannelMessage {
        this.activeUsers += 1;
        const newMessage = {
            channelName: this.name,
            system: true,
            message: `${username} has joined the chat!`,
            time: new Date().toLocaleTimeString(),
        };
        this.addMessage(newMessage);
        return newMessage;
    }

    leaveChannel(username: string) {
        this.activeUsers -= 1;
        const newMessage = {
            channelName: this.name,
            system: true,
            message: `${username} has left the chat!`,
            time: new Date().toLocaleTimeString(),
        };
        this.addMessage(newMessage);
        return newMessage;
    }
}
