import { Account } from './account';

export interface ChannelMessage {
    sender?: Account;
    system: boolean;
    time: string;
    message: string;
}
