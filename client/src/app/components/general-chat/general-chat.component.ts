import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAX_RECONNECTION_DELAY, ONE_SECOND_IN_MS } from '@app/constants/constants';
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
    chats: ChannelMessage[];
    enable: boolean;
    constructor(
        public dialogRef: MatDialogRef<GeneralChatComponent>,
        private playerService: PlayerService,
        private socketService: SocketClientService,
    ) {
        this.chats = [];
        this.enable = false;
    }

    isSender(chatMessage: ChannelMessage): boolean {
        return this.playerService.player.pseudo === chatMessage.sender;
    }

    ngAfterContentChecked(): void {
        setTimeout(() => {
            const chatBar = document.getElementsByClassName('chat-bar')[0] as HTMLInputElement;
            this.enable = chatBar.value !== '';
        }, 0);
    }

    ngOnInit() {
        this.connect();
        this.socketService.send(SocketEvent.GetDiscussionChannels);
    }

    sendChannelMessage(inputElement: HTMLInputElement) {
        if (inputElement.value.length <= 0) return;
        const channelMessage = {
            system: false,
            message: inputElement.value,
            time: new Date().toLocaleTimeString([], { hour12: false }),
            sender: this.playerService.player.pseudo,
            channelName: 'General Chat',
        };
        this.socketService.send(SocketEvent.ChatChannelMessage, channelMessage);
        inputElement.value = '';
        this.chats.push(channelMessage);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private connect() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
            this.socketService.send(SocketEvent.JoinChatChannel, { name: 'General Chat', user: this.playerService.player.pseudo });
            return;
        }
        this.tryReconnection();
    }

    private tryReconnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.socketService.send(SocketEvent.GetDiscussionChannels);
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.ChannelMessage, (channelMessages: ChannelMessage[]) => {
            this.chats = channelMessages;
        });

        this.socketService.on(SocketEvent.AvailableChannels, (channels: DiscussionChannel[]) => {
            this.chats = channels[0].messages;
        });
    }
}
