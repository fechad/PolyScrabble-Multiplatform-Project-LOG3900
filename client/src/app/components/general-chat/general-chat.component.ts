import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-general-chat',
    templateUrl: './general-chat.component.html',
    styleUrls: ['./general-chat.component.scss'],
})
export class GeneralChatComponent implements OnInit, AfterContentChecked {
    @Input() discussionChannel: DiscussionChannel;
    enable: boolean;
    constructor(private playerService: PlayerService, private socketService: SocketClientService) {
        this.enable = false;
        this.discussionChannel = new DiscussionChannel('');
    }

    isSender(chatMessage: ChannelMessage): boolean {
        return this.playerService.player.pseudo === chatMessage.sender;
    }

    ngAfterContentChecked(): void {
        setTimeout(() => {
            const chatBar = document.getElementsByClassName('chat-bar')[0] as HTMLInputElement;
            if (chatBar) this.enable = chatBar.value !== '';
        }, 0);
    }

    ngOnInit() {
        const delay = 100;
        const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
        setTimeout(() => chat.scrollTo(0, chat.scrollHeight), delay);
    }

    sendChannelMessage(inputElement: HTMLInputElement) {
        const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
        const inputValue = inputElement.value;
        if (inputValue.length <= 0 || inputValue.replace(/\s/g, '').length <= 0) return;
        const channelMessage = {
            system: false,
            message: inputElement.value,
            time: new Date().toLocaleTimeString([], { hour12: false }), // TODO: put it server side
            sender: this.playerService.player.pseudo,
            channelName: this.discussionChannel.name,
        };
        this.socketService.send(SocketEvent.ChatChannelMessage, channelMessage);
        inputElement.value = '';
        this.discussionChannel.messages.push(channelMessage);
        setTimeout(() => chat.scrollTo(0, chat.scrollHeight), 0);
    }
}
