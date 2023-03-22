/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
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
    constructor(private playerService: PlayerService, protected socketService: SocketClientService, protected themeService: ThemeService) {
        super(socketService);
        this.isWaitMultiPage = false;
        this.selectedDiscussionChannel = new DiscussionChannel('');
        this.setIpcRender();
    }

    get room(): Room {
        return this.playerService.room;
    }

    get isGameCreator(): boolean {
        return this.room.roomInfo.creatorName === this.playerService.player.pseudo;
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
        this.playerService.player = await this.ipcRenderer.invoke('getStoreValue', 'player');
        this.playerService.room = await this.ipcRenderer.invoke('getStoreValue', 'room');
        this.playerService.account = await this.ipcRenderer.invoke('getStoreValue', 'account');

        this.connectSocket();
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

    createChatChannel(channelName: string) {
        this.socketService.send(SocketEvent.CreateChatChannel, {
            channel: channelName,
            username: {
                username: this.playerService.player.pseudo,
                email: '',
                avatarURL: '',
                level: 0,
                badges: [],
                highScore: 0,
                gamesWon: 0,
                totalXp: 0,
                gamesPlayed: [],
                bestGames: [],
            },
            isRoomChannel: false,
        });
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.ChannelMessage, (channelMessages: ChannelMessage[]) => {
            const discussionChannel = this.getDiscussionChannelByName(channelMessages[0]?.channelName);
            if (!discussionChannel) return;
            discussionChannel.messages = channelMessages;
            const chat = document.getElementsByClassName('chat')[0] as HTMLDivElement;
            setTimeout(() => chat?.scrollTo(0, chat.scrollHeight), 0);
        });

        this.socketService.on(SocketEvent.AvailableChannels, (channels: DiscussionChannel[]) => {
            this.playerService.discussionChannelService.availableChannels = channels;
        });

        this.socketService.on(SocketEvent.RoomChannelUpdated, (roomChannel: DiscussionChannel) => {
            this.playerService.discussionChannelService.roomChannel = roomChannel || new DiscussionChannel('');
            if (roomChannel) {
                this.showRoomChatChannel();
                return;
            }
            this.showChatChannel(0);
        });

        this.socketService.send(SocketEvent.JoinChatChannel, { name: 'General Chat', user: this.playerService.player.pseudo });
        this.socketService.send(SocketEvent.JoinChatChannel, {
            name: this.room.roomInfo.name,
            user: this.playerService.player.pseudo,
            isRoomChannel: true,
        });
        this.updateAvailableChannels();
    }

    private getDiscussionChannelByName(channelName: string): DiscussionChannel | undefined {
        return this.roomChannel.name === channelName
            ? this.roomChannel
            : this.availableDiscussionChannels.find((discussionChannel: DiscussionChannel) => discussionChannel.name === channelName);
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
