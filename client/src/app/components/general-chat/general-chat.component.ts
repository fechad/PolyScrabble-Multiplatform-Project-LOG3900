import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { SocketClientService } from '@app/services/socket-client.service';

const CURRENT_USER = 'me';
@Component({
    selector: 'app-general-chat',
    templateUrl: './general-chat.component.html',
    styleUrls: ['./general-chat.component.scss'],
})
export class GeneralChatComponent implements OnInit {
    chats: ChannelMessage[];
    constructor(public dialogRef: MatDialogRef<GeneralChatComponent>, private socketService: SocketClientService) {
        this.chats = [
            // { system: false, message: "Ceci est un message que j'ai écris", time: '8:30:21', sender: 'me', channelName: 'test' },
            // { system: false, message: 'Ceci est un message écrit par Allan Poe lui même', time: '8:34:06', sender: 'other', channelName: 'test' },
            // { system: true, message: 'Le système détecte un fourberie', time: '8:35:25', sender: 'SYSTEM', channelName: 'test' },
            // { system: false, message: 'wassup2', time: '8:36:10', sender: 'other', channelName: 'test' },
        ];
    }

    isSender(chatMessage: ChannelMessage): boolean {
        return CURRENT_USER === chatMessage.sender;
    }

    ngOnInit() {
        this.connect();
        this.socketService.send(SocketEvent.GetDiscussionChannels /* { name: 'General Chat', user: CURRENT_USER }*/);
    }

    sendChannelMessage(inputElement: HTMLInputElement) {
        this.socketService.send(SocketEvent.ChatChannelMessage, {
            system: false,
            message: inputElement.value,
            time: new Date().toLocaleTimeString([], { hour12: false }),
            sender: CURRENT_USER,
            channelName: 'General Chat',
        });
        inputElement.value = '';
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.ChannelMessage, (channelMessage: ChannelMessage) => {
            console.log(channelMessage);
            this.chats.push(channelMessage);
        });

        this.socketService.on(SocketEvent.AvailableChannels, (channels: DiscussionChannel[]) => {
            console.log(channels[0].messages);
            this.chats = channels[0].messages;
            this.socketService.send(SocketEvent.JoinChatChannel, { name: 'General Chat', user: CURRENT_USER });
        });
    }
}
