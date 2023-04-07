import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { DEFAULT_ROOM_NAME, GENERAL_CHAT_NAME } from '@app/constants/constants';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { LanguageService } from '@app/services/language.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-general-chat',
    templateUrl: './general-chat.component.html',
    styleUrls: ['./general-chat.component.scss'],
})
export class GeneralChatComponent implements OnInit {
    @Input() discussionChannel: DiscussionChannel;
    @Input() inputSideNav: MatSidenav;
    enable: boolean;
    inputValue: string;
    constructor(
        private playerService: PlayerService,
        private socketService: SocketClientService,
        protected themeService: ThemeService,
        private dialog: MatDialog,
        protected languageService: LanguageService,
    ) {
        this.enable = false;
        this.discussionChannel = new DiscussionChannel('');
        this.inputValue = '';
    }

    get isInChannel() {
        return this.discussionChannel.activeUsers.find((user) => user.username === this.playerService.player.clientAccountInfo.username);
    }

    get canQuitChannel(): boolean {
        return (
            !this.discussionChannel.name.toLowerCase().startsWith(DEFAULT_ROOM_NAME.toLowerCase()) &&
            this.discussionChannel.name.toLowerCase() !== GENERAL_CHAT_NAME.toLowerCase()
        );
    }

    get isFrenchLanguage(): boolean {
        return this.languageService.currentLanguage === 'fr';
    }

    get isOwner(): boolean {
        return this.discussionChannel.owner?.username === this.playerService.player.clientAccountInfo.username;
    }

    isSender(chatMessage: ChannelMessage): boolean {
        return this.playerService.player.clientAccountInfo.username === chatMessage.sender;
    }

    // ngAfterContentChecked(): void {
    //     setTimeout(() => {
    //         const chatBar = document.getElementsByClassName('chat-bar')[0] as HTMLInputElement;
    //         if (chatBar) this.enable = chatBar.value !== '';
    //     }, 0);
    // }

    ngOnInit() {
        const delay = 100;
        const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
        setTimeout(() => chat.scrollTo(0, chat.scrollHeight), delay);
    }

    handleLeaveChannel() {
        let leaveChannelText = this.isFrenchLanguage
            ? 'Vous ne receverez plus de nouveaux messages de ce canal de discussion.'
            : "You won't receive any new message from this discussion channel.";

        if (this.isOwner) {
            leaveChannelText = this.isFrenchLanguage
                ? 'Vous supprimerez ce canal de discussion pour tous les autres utilisateurs.'
                : 'You will delete this discussion channel for all the other users.';
        }

        const description: InformationalPopupData = {
            header: this.isFrenchLanguage ? 'Êtes-vous sûr?' : 'Are you sure?',
            body: leaveChannelText,
        };

        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) {
                return;
            }
            this.leaveChannel();
        });
    }

    leaveChannel() {
        if (this.isOwner) {
            this.socketService.send(SocketEvent.CreatorLeaveChatChannel, {
                channel: this.discussionChannel.name,
                username: this.playerService.player.clientAccountInfo.username,
            });
            this.removeUser(this.playerService.player.clientAccountInfo.username);
            return;
        }
        this.socketService.send(SocketEvent.LeaveChatChannel, {
            channel: this.discussionChannel.name,
            username: this.playerService.player.clientAccountInfo.username,
        });
        this.removeUser(this.playerService.player.clientAccountInfo.username);
    }

    sendChannelMessage() {
        const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
        if (this.inputValue.length <= 0 || this.inputValue.replace(/\s/g, '').length <= 0) return;

        if (!this.isInChannel) {
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: this.discussionChannel.name,
                user: this.playerService.player.clientAccountInfo.username,
            });
            this.discussionChannel.activeUsers.push({
                socketId: this.socketService.socket.id,
                username: this.playerService.player.clientAccountInfo.username,
            });
        }

        const channelMessage = {
            system: false,
            message: this.inputValue,
            time: new Date().toLocaleTimeString([], { hour12: false }), // TODO: put it server side
            sender: this.playerService.player.clientAccountInfo.username,
            account: this.playerService.player.clientAccountInfo,
            channelName: this.discussionChannel.name,
        };
        this.socketService.send(SocketEvent.ChatChannelMessage, channelMessage);
        this.inputValue = '';
        this.discussionChannel.messages.push(channelMessage);
        setTimeout(() => chat.scrollTo(0, chat.scrollHeight), 0);
    }

    showSummary(accountInfo?: ClientAccountInfo) {
        if (!accountInfo) return;
        this.playerService.setPlayerToShow(accountInfo);
        this.inputSideNav.toggle();
    }

    private removeUser(userName: string) {
        const userToRemove = this.discussionChannel.activeUsers.find((user) => user.username === userName);
        if (!userToRemove) return;
        this.discussionChannel.activeUsers.splice(this.discussionChannel.activeUsers.indexOf(userToRemove), 1);
    }
}
