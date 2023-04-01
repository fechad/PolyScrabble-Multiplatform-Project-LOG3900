import { ChannelMessage } from '@app/interfaces/channel-message';
import { Account } from '@app/interfaces/firestoreDB/account';

export class DiscussionChannel {
    name: string;
    owner?: Account;
    activeUsers: { username: string; socketId: string }[];
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
        return this.activeUsers.find((user) => user.username === userName) ? true : false;
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

    joinChannel(socketId: string, username: string): ChannelMessage | undefined {
        if (this.userExists(username)) {
            return;
        }

        this.activeUsers.push({ socketId, username });

        const newMessage = {
            channelName: this.name,
            system: true,
            message: `${username} has joined the chat!`,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        this.addMessage(newMessage);
        return newMessage;
    }

    removeUser(username: string): string {
        const userToRemove = this.activeUsers.find((user) => user.username === username);
        if (!userToRemove) return '';
        this.activeUsers.splice(this.activeUsers.indexOf(userToRemove), 1);
        return userToRemove.username;
    }

    leaveChannel(username: string) {
        const userRemoved = this.removeUser(username);
        if (!userRemoved) return;

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
