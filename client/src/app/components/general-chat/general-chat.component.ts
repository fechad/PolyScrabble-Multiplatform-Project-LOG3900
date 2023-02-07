import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelMessage } from '@app/interfaces/channel-message';
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
            { system: false, message: "Ceci est un message que j'ai écris", time: '8:30', sender: 'me', channelName: 'test' },
            { system: false, message: 'Ceci est un message écrit par Allan Poe lui même', time: '8:31', sender: 'other', channelName: 'test' },
            { system: true, message: 'Le système détecte un fourberie', time: '8:30', sender: 'SYSTEM', channelName: 'test' },
            { system: false, message: 'wassup2', time: '8:31', sender: 'other', channelName: 'test' },
        ];
    }

    ngOnInit() {
        this.connect();
        this.socketService.send('joinChatChannel', { name: 'General Chat', user: CURRENT_USER });
    }

    sendChannelMessage(inputElement: HTMLInputElement) {
        this.socketService.send('chatChannelMessage', {
            system: false,
            message: inputElement.value,
            time: '8:30',
            sender: 'me',
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
        this.socketService.on('channelMessage', (channelMessage: ChannelMessage) => {
            this.chats.push(channelMessage);
        });
    }
}
