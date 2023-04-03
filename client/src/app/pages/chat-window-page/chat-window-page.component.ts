/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { ChannelCreationPopupComponent } from '@app/components/channel-creation-popup/channel-creation-popup.component';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { RoomObserver } from '@app/interfaces/room-observer';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { LanguageService } from '@app/services/language.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-chat-window-page',
    templateUrl: './chat-window-page.component.html',
    styleUrls: ['./chat-window-page.component.scss'],
})
export class ChatWindowPageComponent extends PageCommunicationManager implements OnInit {
    @Input() isWaitMultiPage: boolean;
    @Input() isGamePage: boolean;

    @ViewChild('chatMenu', { static: false }) private chatMenu!: ElementRef<HTMLDivElement>;
    @ViewChild('chatContainer', { static: false }) private chatContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuContainer', { static: false }) private menuContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuDarkBackground', { static: false }) private menuDarkBackground!: ElementRef<HTMLDivElement>;
    selectedDiscussionChannel: DiscussionChannel;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcRenderer: any;
    constructor(
        private playerService: PlayerService,
        protected socketService: SocketClientService,
        protected themeService: ThemeService,
        protected languageService: LanguageService,
        private dialog: MatDialog,
    ) {
        super(socketService);
        this.isWaitMultiPage = false;
        this.selectedDiscussionChannel = new DiscussionChannel('');
        this.setIpcRender();
    }

    get room(): Room {
        return this.playerService.room;
    }

    get isGameCreator(): boolean {
        return this.room.roomInfo.creatorName === this.playerService.player.clientAccountInfo.username;
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    get availableDiscussionChannels(): DiscussionChannel[] {
        return this.playerService.discussionChannelService.availableChannels;
    }

    get roomChannel(): DiscussionChannel {
        return this.playerService.discussionChannelService.roomChannel;
    }

    async ngOnInit() {
        const storedPlayerService = await this.ipcRenderer.invoke('getStoreValue', 'playerService');
        const channelToShowName = await this.ipcRenderer.invoke('getStoreValue', 'channelToShow');

        this.playerService.setPlayerServiceInfo(storedPlayerService);
        this.themeService.verifyTheme();
        this.languageService.verifyLanguage();

        const channelToShowIndex = this.availableDiscussionChannels.find((discussionChannel) => discussionChannel.name === channelToShowName);
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
        channelToShowIndex ? this.showChatChannel(this.availableDiscussionChannels.indexOf(channelToShowIndex)) : this.showChatChannel(0);
        this.connectSocket();
        this.socketService.send(SocketEvent.ChatWindowSocket);
    }

    showChatMenu() {
        this.chatMenu.nativeElement.classList.add('show');
        this.menuDarkBackground.nativeElement.classList.add('show');
    }

    closeChatMenu() {
        this.chatMenu.nativeElement.classList.remove('show');
        this.menuDarkBackground.nativeElement.classList.remove('show');
    }

    showChatChannel(discussionChannelIndex: number) {
        if (discussionChannelIndex < 0 || discussionChannelIndex > this.availableDiscussionChannels.length) return;
        this.selectedDiscussionChannel = this.availableDiscussionChannels[discussionChannelIndex];
        if (!this.selectedDiscussionChannel) return;
        this.closeChatMenu();
        this.menuContainer.nativeElement.classList.add('show');
        this.chatContainer.nativeElement.classList.add('show');
    }

    showRoomChatChannel() {
        this.selectedDiscussionChannel = this.roomChannel;
        this.closeChatMenu();
        this.menuContainer.nativeElement.classList.add('show');
        this.chatContainer.nativeElement.classList.add('show');
    }

    closeChat() {
        this.menuContainer.nativeElement.classList.remove('show');
        this.chatContainer.nativeElement.classList.remove('show');
    }

    updateAvailableChannels() {
        this.socketService.send(SocketEvent.GetDiscussionChannels);
    }

    createChatChannel() {
        const dialog = this.dialog.open(ChannelCreationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });

        dialog.afterClosed().subscribe(async (channelName) => {
            if (!channelName) return;
            this.socketService.send(SocketEvent.CreateChatChannel, {
                channel: channelName,
                username: this.playerService.reducePLayerInfo(),
                isRoomChannel: false,
            });
        });
    }

    leaveRoom() {
        // TODO: can't leave room from new window
        if (this.playerService.player.isCreator) {
            this.socketService.send(SocketEvent.LeaveRoomCreator, this.room.roomInfo.name);
        } else {
            this.socketService.send(SocketEvent.LeaveRoomOther, this.room.roomInfo.name);
        }
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.ChannelMessage, (channelMessages: ChannelMessage[]) => {
            const discussionChannel = this.getDiscussionChannelByName(channelMessages[0]?.channelName);
            if (!discussionChannel) return;

            if (discussionChannel.name === this.selectedDiscussionChannel.name) this.selectedDiscussionChannel.messages = channelMessages;
            else discussionChannel.messages = channelMessages;

            const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
            setTimeout(() => chat?.scrollTo(0, chat.scrollHeight), 0);
        });

        this.socketService.on(SocketEvent.AvailableChannels, (channels: DiscussionChannel[]) => {
            this.playerService.discussionChannelService.availableChannels = channels;
            if (this.selectedDiscussionChannel.name && !channels.find((channel) => channel.name === this.selectedDiscussionChannel.name)) {
                if (this.isWaitMultiPage) {
                    this.showRoomChatChannel();
                    return;
                }
                this.showChatChannel(0);
            }
        });

        this.socketService.on(SocketEvent.RoomChannelUpdated, (roomChannel: DiscussionChannel) => {
            this.playerService.discussionChannelService.roomChannel = roomChannel || new DiscussionChannel('');
            if (roomChannel) {
                this.showRoomChatChannel();
                return;
            }
            this.showChatChannel(0);
        });

        this.socketService.on(SocketEvent.RoomCreatorLeft, () => {
            this.socketService.send(SocketEvent.LeaveRoomOther, this.room.roomInfo.name);
            // TODO: close new window
        });

        this.socketService.on(SocketEvent.ObserversUpdated, (roomObservers: RoomObserver[]) => {
            this.room.observers = roomObservers;
        });

        this.socketService.send(SocketEvent.JoinChatChannel, {
            name: 'General Chat',
            user: this.playerService.player.clientAccountInfo.username,
        });

        if (this.playerService.discussionChannelService.roomChannel.name !== '') {
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: this.room.roomInfo.name,
                user: this.playerService.player.clientAccountInfo.username,
                isRoomChannel: true,
            });
        }

        for (const discussionChannel of this.availableDiscussionChannels) {
            if (discussionChannel.activeUsers.find((user) => user.username === this.playerService.player.clientAccountInfo.username)) {
                this.socketService.send(SocketEvent.JoinChatChannel, {
                    name: discussionChannel.name,
                    user: this.playerService.player.clientAccountInfo.username,
                });
            }
        }

        this.updateAvailableChannels();
    }

    private getDiscussionChannelByName(channelName: string): DiscussionChannel | undefined {
        return this.playerService.discussionChannelService.roomChannel.name === channelName
            ? this.playerService.discussionChannelService.roomChannel
            : this.playerService.discussionChannelService.availableChannels.find(
                  (discussionChannel: DiscussionChannel) => discussionChannel.name === channelName,
              );
    }

    private setIpcRender() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
        } catch (error) {
            return;
        }
    }
}
