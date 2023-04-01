import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from './account';

export class DiscussionChannel {
    name: string;
    owner?: Account;
    activeUsers: { socketId: string; username: string }[];
    messages: ChannelMessage[];

    constructor(name: string, owner?: Account) {
        this.name = name;
        this.owner = owner;
        this.activeUsers = [];
        this.messages = [];
    }
}
