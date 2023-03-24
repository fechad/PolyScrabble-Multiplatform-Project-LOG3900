import { DiscussionChannel } from '@app/interfaces/discussion-channel';

export class DiscussionChannelService {
    availableChannels: DiscussionChannel[];
    roomChannel: DiscussionChannel;

    constructor() {
        this.availableChannels = [];
        this.roomChannel = new DiscussionChannel('');
    }

    reinitialize() {
        this.availableChannels = [];
        this.roomChannel = new DiscussionChannel('');
    }
}
