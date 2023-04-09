/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ChannelCreationPopupComponent } from '@app/components/channel-creation-popup/channel-creation-popup.component';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { GENERAL_CHAT_NAME } from '@app/constants/constants';
import { DEFAULT_BOT_IMAGE } from '@app/constants/default-user-settings';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { RoomObserver } from '@app/interfaces/room-observer';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { AudioService } from '@app/services/audio.service';
import { BackgroundService } from '@app/services/background-image.service';
import { HintService } from '@app/services/hint.service';
import { HttpService } from '@app/services/http.service';
import { LanguageService } from '@app/services/language.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent extends ComponentCommunicationManager implements OnInit {
    @Input() isWaitMultiPage: boolean;
    @Input() isGamePage: boolean;

    @ViewChild('chatMenu', { static: false }) private chatMenu!: ElementRef<HTMLDivElement>;
    @ViewChild('chatContainer', { static: false }) private chatContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuContainer', { static: false }) private menuContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuDarkBackground', { static: false }) private menuDarkBackground!: ElementRef<HTMLDivElement>;

    selectedDiscussionChannel: DiscussionChannel;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcRenderer: any;

    protected searchChannelInput: string;
    constructor(
        private playerService: PlayerService,
        private httpService: HttpService,
        private router: Router,
        protected socketService: SocketClientService,
        private dialog: MatDialog,
        protected hintService: HintService,
        private audioService: AudioService,
        protected themeService: ThemeService,
        protected backgroundService: BackgroundService,
        protected languageService: LanguageService,
    ) {
        super(socketService);
        this.searchChannelInput = '';
        this.isWaitMultiPage = false;
        this.selectedDiscussionChannel = new DiscussionChannel('');
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
        } catch (error) {
            return;
        }
    }

    get botAvatarUrl(): string {
        return DEFAULT_BOT_IMAGE;
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

    get isNewChatWindowOpen(): boolean {
        return this.playerService.isNewChatWindowOpen;
    }

    get availableDiscussionChannels(): DiscussionChannel[] {
        return this.playerService.discussionChannelService.availableChannels;
    }

    get roomChannel(): DiscussionChannel {
        return this.playerService.discussionChannelService.roomChannel;
    }

    get formattedTimerPerTurn() {
        const timerPerTurn = parseInt(this.room.roomInfo.timerPerTurn, 10);
        const min = 60;
        const last = -2;
        return Math.floor(timerPerTurn / min).toString() + 'm' + ('0' + (timerPerTurn - Math.floor(timerPerTurn / min) * min).toString()).slice(last);
    }

    get isObserver(): boolean {
        return this.playerService.isObserver;
    }

    get filteredChannels(): DiscussionChannel[] {
        return this.availableDiscussionChannels.filter(
            (discussionChannel) => discussionChannel.name === GENERAL_CHAT_NAME || discussionChannel.name.includes(this.searchChannelInput),
        );
    }

    ngOnInit() {
        this.closeChatNewWindow();
        this.connectSocket();
    }

    showChatMenu() {
        this.chatMenu.nativeElement.classList.add('show');
        this.menuDarkBackground.nativeElement.classList.add('show');
    }

    showHint() {
        if (this.playerService.player.isItsTurn && this.hintService.nbHints !== 0) this.hintService.showHint();
    }

    isYourTurn() {
        return this.playerService.player.isItsTurn;
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
        if (this.playerService.player.isCreator) {
            this.socketService.send(SocketEvent.LeaveRoomCreator, this.room.roomInfo.name);
        } else {
            this.socketService.send(SocketEvent.LeaveRoomOther, this.room.roomInfo.name);
        }

        this.navigateHome();
    }

    handlePlayerFound(data: { room: Room; player: Player }) {
        this.room.setPlayers(data.room.players);

        const description: InformationalPopupData = {
            header: this.languageService.currentLanguage === 'fr' ? "Demande d'accès à la partie" : 'Game access request',
            body:
                this.languageService.currentLanguage === 'fr'
                    ? `Voulez-vous accepter ${data.player.clientAccountInfo.username} dans la salle de jeu?`
                    : `Would you like to accept ${data.player.clientAccountInfo.username} in this game lobby?`,
        };

        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) {
                this.rejectPlayer(data.player.clientAccountInfo.username);
                return;
            }
            this.acceptPlayer(data.player.clientAccountInfo.username);
        });
    }

    acceptPlayer(playerName: string) {
        // TODO: remove currentPlayerPseudo. It is obsolete
        this.room.currentPlayerPseudo = this.playerService.player.clientAccountInfo.username;
        this.socketService.send(SocketEvent.AcceptPlayer, { roomName: this.room.roomInfo.name, playerName });
    }

    rejectPlayer(playerName: string) {
        this.room.removePlayerByName(playerName);
        this.socketService.send(SocketEvent.RejectPlayer, { roomName: this.room.roomInfo.name, playerName });
    }

    requestGameStart() {
        this.socketService.send(SocketEvent.StartGameRequest, this.room.roomInfo.name);
    }

    navigateSettings() {
        this.handlePageChange();
        this.router.navigate(['/settings']);
    }

    navigateHome() {
        this.handlePageChange();
        if (this.router.url === '/game') this.playerService.setUserInfo();
        this.router.navigate(['/main']);
    }

    navigateUserPage() {
        this.handlePageChange();
        this.router.navigate(['/user']);
    }

    navigateObserveRoomPage() {
        this.handlePageChange();
        this.playerService.isObserver = true;
        this.room.roomInfo.gameType = 'classic';
        this.router.navigate(['game/multiplayer/join']);
    }

    async logOut() {
        this.audioService.stopSound();
        lastValueFrom(this.httpService.logoutUser(this.playerService.player.clientAccountInfo.username));

        this.socketService.send(SocketEvent.LogOut);

        this.playerService.resetPlayerAndRoomInfo();
        this.themeService.currentTheme = 'light-theme';
        this.themeService.darkThemeSelected = false;
        this.themeService.setTheme();
        this.router.navigate(['/home']);
    }

    confirmLeaving() {
        const description: InformationalPopupData = {
            header: this.languageService.currentLanguage === 'fr' ? 'Voulez-vous vraiment abandonner ?' : 'Do you really want to quit?',
            body:
                this.languageService.currentLanguage === 'fr'
                    ? 'Vous ne pourrez plus rejoindre la partie en en tant que joueur par la suite.'
                    : "You won't be able to join back the game as a player once you leave.",
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe((result) => {
            if (!result) return;
            this.leaveGame();
        });
    }

    leaveGame() {
        this.socketService.send(SocketEvent.LeaveGame);
        this.navigateHome();
        this.backgroundService.setBackground('');
    }

    openChatOnNewWindow() {
        try {
            this.ipcRenderer.send('open-chat', {
                playerService: {
                    player: this.playerService.player,
                    stats: this.playerService.stats,
                    room: this.playerService.room,
                    isNewChatWindowOpen: this.playerService.isNewChatWindowOpen,
                    discussionChannelService: this.playerService.discussionChannelService,
                    isObserver: this.playerService.isObserver,
                },
                channelToShow: this.selectedDiscussionChannel.name,
            });
            this.closeChat();
            this.playerService.isNewChatWindowOpen = true;
        } catch (error) {
            return;
        }
    }

    closeChatNewWindow() {
        try {
            this.ipcRenderer.send('close-chat');
            this.updateAvailableChannels();
            this.playerService.isNewChatWindowOpen = false;
        } catch (error) {
            return;
        }
    }

    handlePageChange() {
        this.closeChat();
        this.audioService.stopSound();
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.ChannelMessage, (channelMessages: ChannelMessage[]) => {
            const discussionChannel = this.getDiscussionChannelByName(channelMessages[0]?.channelName);
            if (!discussionChannel) return;
            discussionChannel.messages = channelMessages;
            const chat = document.getElementById('only-chat-container') as HTMLDivElement;
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
            this.handleGameWaitPage();
        });

        this.socketService.on(SocketEvent.PlayerAccepted, (room: Room) => {
            this.room.setPlayers(room.players);
        });

        this.socketService.on(SocketEvent.PlayerFound, (data: { room: Room; player: Player }) => {
            this.handlePlayerFound(data);
        });

        this.socketService.on(SocketEvent.PlayerLeft, (playerWhoLeft: Player) => {
            this.room.removePlayerByName(playerWhoLeft.clientAccountInfo.username);
            if (this.room.players.length <= this.room.roomInfo.maxPlayers - 1) {
                this.socketService.send(SocketEvent.SetRoomAvailable, this.room.roomInfo.name);
            }
        });

        this.socketService.on(SocketEvent.RoomCreatorLeft, () => {
            this.socketService.send(SocketEvent.LeaveRoomOther, this.room.roomInfo.name);
            if (this.isWaitMultiPage) this.router.navigate(['/main']);
        });

        this.socketService.on(SocketEvent.ObserversUpdated, (roomObservers: RoomObserver[]) => {
            this.room.observers = roomObservers;
        });

        this.socketService.on(SocketEvent.GameStarted, () => {
            this.router.navigate(['/game']);
        });

        if (this.playerService.discussionChannelService.availableChannels.length === 0) {
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: 'General Chat',
                user: this.playerService.player.clientAccountInfo.username,
            });
        }

        if (this.isGamePage && this.playerService.discussionChannelService.roomChannel.name === '') {
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: this.room.roomInfo.name,
                user: this.playerService.player.clientAccountInfo.username,
                isRoomChannel: true,
            });
        } else if (!this.isGamePage && this.playerService.discussionChannelService.roomChannel.name !== '') {
            this.playerService.discussionChannelService.roomChannel = new DiscussionChannel('');
        }

        this.updateAvailableChannels();
    }

    protected isDrawerOpen(drawer: MatSidenav) {
        return drawer.opened;
    }
    private handleGameWaitPage() {
        if (this.isWaitMultiPage) this.showRoomChatChannel();
    }

    private getDiscussionChannelByName(channelName: string): DiscussionChannel | undefined {
        return this.roomChannel.name === channelName
            ? this.roomChannel
            : this.availableDiscussionChannels.find((discussionChannel: DiscussionChannel) => discussionChannel.name === channelName);
    }
}
