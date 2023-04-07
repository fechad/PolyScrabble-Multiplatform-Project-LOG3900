import { ClientAccountInfo } from './serveur info exchange/client-account-info';

export interface ChannelMessage {
    channelName: string;
    sender?: string;
    account?: ClientAccountInfo;
    system: boolean;
    time: string;
    message: string;
}
