import { ChannelMessage } from '@app/interfaces/channel-message';
import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
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

    userSentMessage(userEmail: string): boolean {
        return this.allTimeUsersMessage.get(userEmail) ? true : false;
    }

    addMessage(message: ChannelMessage) {
        this.messages.push(message);
        if (!message.sender) return;
        this.handleNewUserMessage(message);
    }

    updatePlayerAccount(account: ClientAccountInfo) {
        const userMessages = this.allTimeUsersMessage.get(account.email);
        if (!userMessages) return;
        const previousUserName = userMessages[0].sender;
        if (!previousUserName) return;

        for (const message of userMessages) {
            message.sender = account.username;
            message.account = account;
        }
        if (previousUserName === account.username) return;

        if (this.owner?.username === previousUserName) this.owner.username = account.username;
        this.swapActiveUser(previousUserName, account.username);
        this.allTimeUsersMessage.set(account.email, userMessages);
    }

    swapActiveUser(previousUserName: string, newUserName: string) {
        const activeUser = this.activeUsers.find((user) => user.username === previousUserName);
        if (!activeUser) return;
        this.activeUsers[this.activeUsers.indexOf(activeUser)] = { username: newUserName, socketId: activeUser.socketId };
    }

    joinChannel(socketId: string, username: string): ChannelMessage | undefined {
        if (this.userExists(username)) {
            return;
        }

        this.activeUsers.push({ socketId, username });

        const newMessage = {
            channelName: this.name,
            system: true,
            message: `➕ ${username} ➕`,
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
            message: `❌ ${username} ❌`,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        this.addMessage(newMessage);
        return newMessage;
    }

    private handleNewUserMessage(message: ChannelMessage) {
        if (!message.sender || !message.account) return;

        const usersMessages = this.allTimeUsersMessage.get(message.account.email);
        if (!usersMessages) {
            this.allTimeUsersMessage.set(message.account.email, [message]);
            return;
        }
        usersMessages.push(message);
    }
}
