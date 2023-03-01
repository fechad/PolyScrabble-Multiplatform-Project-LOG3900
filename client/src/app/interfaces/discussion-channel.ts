import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from './account';

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
}
