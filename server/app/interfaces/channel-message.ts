export interface ChannelMessage {
    channelName: string;
    sender?: string;
    system: boolean;
    time: string;
    message: string;
}
