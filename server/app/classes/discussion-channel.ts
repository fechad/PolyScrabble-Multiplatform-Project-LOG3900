import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';

export class DiscussionChannel {
    name: string;
    owner?: Account;
    activeUsers: string[];
    messages: ChannelMessage[];

    private allTimeUsersMessage: Map<string, ChannelMessage[]>;

    constructor(name: string, owner?: Account) {
        this.name = name;
        this.owner = owner;
        this.activeUsers = [];
        this.messages = [];
        this.allTimeUsersMessage = new Map<string, ChannelMessage[]>();
    }

    userExists(userName: string): boolean {
        return this.activeUsers.includes(userName);
    }

    userSentMessage(userName: string): boolean {
        return this.allTimeUsersMessage.get(userName) ? true : false;
    }

    addMessage(message: ChannelMessage) {
        this.messages.push(message);
        if (!message.sender) return;
        this.handleNewUserMessage(message);
    }

    updatePlayerAvatarUrl(playerName: string, avatarUrl: string) {
        const userMessages = this.allTimeUsersMessage.get(playerName);
        if (!userMessages) return;
        for (const message of userMessages) {
            message.avatarUrl = avatarUrl;
        }
    }

    updatePlayerUsername(previousUserName: string, newUserName: string) {
        const userMessages = this.allTimeUsersMessage.get(previousUserName);
        if (!userMessages) return;
        for (const message of userMessages) {
            message.sender = newUserName;
        }
        this.allTimeUsersMessage.set(newUserName, userMessages);
        this.allTimeUsersMessage.delete(previousUserName);
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

    private handleNewUserMessage(message: ChannelMessage) {
        if (!message.sender) return;

        const usersMessages = this.allTimeUsersMessage.get(message.sender);
        if (!usersMessages) {
            this.allTimeUsersMessage.set(message.sender, [message]);
            return;
        }
        usersMessages.push(message);
    }
}
