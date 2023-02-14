import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';

export class DiscussionChannel {
    name: string;
    owner?: Account;
    activeUsers: string[];
    messages: ChannelMessage[];

    constructor(name: string, owner?: Account) {
        this.name = name;
        this.owner = owner;
        this.activeUsers = [];
        this.messages = [];
    }

    userExists(userName: string): boolean {
        return this.activeUsers.find((name: string) => userName === name) ? true : false;
    }

    addMessage(message: ChannelMessage) {
        this.messages.push(message);
    }

    joinChannel(username: string): ChannelMessage | undefined {
        if (this.userExists(username)) {
            return;
        }

        this.activeUsers.push(username);

        const newMessage = {
            channelName: this.name,
            system: true,
            message: `${username} has joined the chat!`,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        this.addMessage(newMessage);
        return newMessage;
    }

    removeUser(username: string) {
        const userToRemove = this.activeUsers.find((name: string) => username === name);
        if (userToRemove) {
            this.activeUsers.splice(this.activeUsers.indexOf(userToRemove), 1);
        }
    }

    leaveChannel(username: string) {
        this.removeUser(username);
        const newMessage = {
            channelName: this.name,
            system: true,
            message: `${username} has left the chat!`,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        this.addMessage(newMessage);
        return newMessage;
    }
}
