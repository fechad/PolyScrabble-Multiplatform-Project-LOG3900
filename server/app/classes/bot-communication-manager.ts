import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { Observer } from './observer-pattern/observer';

export class BotCommunicationManager implements Observer {
    wantedMessages: { message: string; sender: string; account: ClientAccountInfo }[];
    constructor() {
        this.wantedMessages = [];
    }

    handleObservableNotification(data: { message: string; sender: string; account: ClientAccountInfo }): void {
        if (!data || !data.message) return;
        this.wantedMessages.push(data);
    }

    popFirstWantedMessage(): { message: string; sender: string; account: ClientAccountInfo } | undefined {
        if (this.wantedMessages.length <= 0) return;
        const messageToSend = this.wantedMessages[0];
        this.wantedMessages.splice(0, 1);
        return messageToSend;
    }
}
