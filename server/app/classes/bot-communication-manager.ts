import { Observer } from './observer-pattern/observer';

export class BotCommunicationManager implements Observer {
    wantedMessages: { message: string; sender: string }[];
    constructor() {
        this.wantedMessages = [];
    }

    handleObservableNotification(data: { message: string; sender: string }): void {
        if (!data || !data.message) return;
        this.wantedMessages.push(data);
    }

    popFirstWantedMessage(): { message: string; sender: string } | undefined {
        if (this.wantedMessages.length <= 0) return;
        const messageToSend = this.wantedMessages[0];
        this.wantedMessages.splice(0, 1);
        return messageToSend;
    }
}
