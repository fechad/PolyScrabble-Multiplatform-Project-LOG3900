import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-general-chat',
    templateUrl: './general-chat.component.html',
    styleUrls: ['./general-chat.component.scss'],
})
export class GeneralChatComponent {
    @Input() inputSideNav: MatSidenav;
    @ViewChild('chat', { static: true }) private chat: ElementRef;
    enable: boolean;
    inputValue: string;
    discussionChannel: DiscussionChannel;
    constructor(
        private playerService: PlayerService,
        private socketService: SocketClientService,
        protected themeService: ThemeService,
        private dialog: MatDialog,
        public objService: OutgameObjectivesService,
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
        return this.playerService.account.userSettings.defaultLanguage === 'french';
    }

    get inputPlaceholder(): string {
        if (this.isFrenchLanguage) {
            if (this.isInChannel) return 'Entrez un message';
            return 'Entrez un message pour rejoindre le canal';
        }

        if (this.isInChannel) return 'Type a message';
        return 'Type a message to join the channel';
    }

    get isOwner(): boolean {
        return this.discussionChannel.owner?.username === this.playerService.player.clientAccountInfo.username;
    }

    @Input() set discussionChannelInput(discussionChannel: DiscussionChannel) {
        this.discussionChannel = discussionChannel;
        this.scrollChatToBottom();
    }

    isSender(chatMessage: ChannelMessage): boolean {
        return this.playerService.player.clientAccountInfo.username === chatMessage.sender;
    }

    scrollChatToBottom() {
        if (!this.chat) return;
        setTimeout(() => {
            this.chat.nativeElement.scrollTo({
                top: this.chat.nativeElement.scrollHeight,
                left: 0,
                behavior: 'instant',
            });
        }, 1);
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
        if (this.inputValue.length <= 0 || this.inputValue.replace(/\s/g, '').length <= 0) return;

        if (!this.isInChannel) {
            this.joinChannel();
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
        this.scrollChatToBottom();
    }

    joinChannel() {
        this.socketService.send(SocketEvent.JoinChatChannel, {
            name: this.discussionChannel.name,
            user: this.playerService.player.clientAccountInfo.username,
        });
        this.discussionChannel.activeUsers.push({
            socketId: this.socketService.socket.id,
            username: this.playerService.player.clientAccountInfo.username,
        });
    }

    async showSummary(accountInfo?: ClientAccountInfo) {
        if (!accountInfo) return;
        await this.playerService.setPlayerToShow(accountInfo);
        this.showTarget();
        this.inputSideNav.toggle();
    }

    showTarget() {
        const playerToShow = this.playerService.playerToShow;
        this.objService.objectives = [];
        if (!playerToShow || !this.playerService.playerToShowStat) return;
        this.objService.generateObjectives(this.playerService.playerToShowStat, playerToShow);
    }

    private removeUser(userName: string) {
        const userToRemove = this.discussionChannel.activeUsers.find((user) => user.username === userName);
        if (!userToRemove) return;
        this.discussionChannel.activeUsers.splice(this.discussionChannel.activeUsers.indexOf(userToRemove), 1);
    }
}
