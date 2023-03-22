export interface ChannelMessage {
    channelName: string;
    sender?: string;
    avatarUrl?: string;
    system: boolean;
    time: string;
    message: string;
}
