/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { SocketEvent } from '@app/enums/socket-event';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { AudioService } from '@app/services/audio.service';
import { HintService } from '@app/services/hint.service';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

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
    constructor(
        private playerService: PlayerService,
        private httpService: HttpService,
        private router: Router,
        protected socketService: SocketClientService,
        private dialog: MatDialog,
        protected hintService: HintService,
        private audioService: AudioService,
    ) {
        super(socketService);
        this.isWaitMultiPage = false;
        this.selectedDiscussionChannel = new DiscussionChannel('');
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
        } catch (error) {
            return;
        }
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

    get isNewChatWindowOpen(): boolean {
        return this.playerService.isNewChatWindowOpen;
    }

    get availableDiscussionChannels(): DiscussionChannel[] {
        return this.playerService.discussionChannelService.availableChannels;
    }

    get roomChannel(): DiscussionChannel {
        return this.playerService.discussionChannelService.roomChannel;
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
        if (this.playerService.player.isItsTurn) this.hintService.showHint();
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

    leaveRoom() {
        this.audioService.stopSound();
        if (this.selectedDiscussionChannel.owner?.username === this.playerService.player.pseudo) {
            this.socketService.send(SocketEvent.LeaveRoomCreator, this.room.roomInfo.name);
        } else {
            this.socketService.send(SocketEvent.LeaveRoomOther, this.room.roomInfo.name);
        }

        this.room.reinitialize(this.room.roomInfo.gameType);
        this.router.navigate(['/main']);
    }

    handlePlayerFound(data: { room: Room; player: Player }) {
        this.room.players = data.room.players;

        const description: InformationalPopupData = {
            header: "Demande d'accès à la partie",
            body: `Voulez-vous accepter ${data.player.pseudo} dans la salle de jeu?`,
        };

        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe(async (result) => {
            if (!result) {
                this.rejectPlayer(data.player.pseudo);
                return;
            }
            this.acceptPlayer(data.player.pseudo);
        });
    }

    acceptPlayer(playerName: string) {
        // TODO: remove currentPlayerPseudo. It is obsolete
        this.room.currentPlayerPseudo = this.playerService.player.pseudo;
        this.socketService.send(SocketEvent.AcceptPlayer, { roomName: this.room.roomInfo.name, playerName });
    }

    rejectPlayer(playerName: string) {
        this.socketService.send(SocketEvent.RejectPlayer, { roomName: this.room.roomInfo.name, playerName });
    }

    requestGameStart() {
        this.socketService.send(SocketEvent.StartGameRequest, this.room.roomInfo.name);
    }

    navigateSettings() {
        this.router.navigate(['/settings']);
    }

    navigateHome() {
        this.audioService.stopSound();
        this.router.navigate(['/main']);
    }

    navigateUserPage() {
        this.router.navigate(['/user']);
    }

    async logOut() {
        this.audioService.stopSound();
        if (environment.production) await lastValueFrom(this.httpService.logoutUser(this.playerService.player.pseudo));
        this.socketService.send(SocketEvent.LeaveChatChannel, { channel: 'General Chat', username: this.playerService.player.pseudo });
        this.playerService.player.pseudo = '';
        this.router.navigate(['/home']);
    }

    confirmLeaving() {
        const description: InformationalPopupData = {
            header: 'Voulez-vous vraiment abandonner ?',
            body: 'Vous ne serez pas dans le tableau des meilleurs scores.',
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
        this.audioService.stopSound();
        this.socketService.send(SocketEvent.LeaveGame);
        this.router.navigate(['/main']);
    }

    openChatOnNewWindow() {
        try {
            this.ipcRenderer.send('open-chat', {
                room: this.room,
                player: this.playerService.player,
                account: this.playerService.account,
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
            this.playerService.isNewChatWindowOpen = false;
        } catch (error) {
            return;
        }
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
            this.handleGameWaitPage();
        });

        this.socketService.on(SocketEvent.PlayerAccepted, (room: Room) => {
            this.room.players = room.players;
        });

        this.socketService.on(SocketEvent.PlayerFound, (data: { room: Room; player: Player }) => {
            this.handlePlayerFound(data);
        });

        this.socketService.on(SocketEvent.PlayerLeft, (playerWhoLeft: Player) => {
            const playerToRemove = this.room.players.find((player: Player) => player.pseudo === playerWhoLeft.pseudo);
            if (playerToRemove) {
                this.room.players.splice(this.room.players.indexOf(playerToRemove), 1);
            }
            if (this.room.players.length === this.room.roomInfo.maxPlayers - 1) {
                this.socketService.send(SocketEvent.SetRoomAvailable, this.room.roomInfo.name);
            }
        });

        this.socketService.on(SocketEvent.GameStarted, () => {
            this.router.navigate(['/game']);
        });

        if (this.playerService.discussionChannelService.availableChannels.length === 0) {
            this.socketService.send(SocketEvent.JoinChatChannel, { name: 'General Chat', user: this.playerService.player.pseudo });
        }

        if (this.isGamePage && this.playerService.discussionChannelService.roomChannel.name === '') {
            this.socketService.send(SocketEvent.JoinChatChannel, {
                name: this.room.roomInfo.name,
                user: this.playerService.player.pseudo,
                isRoomChannel: true,
            });
        }

        this.updateAvailableChannels();
    }

    private handleGameWaitPage() {
        if (this.isWaitMultiPage && this.roomChannel.name === '') {
            // TODO warn that creator left;
            this.router.navigate(['/main']);
            return;
        }
        if (this.isWaitMultiPage) this.showRoomChatChannel();
    }

    private getDiscussionChannelByName(channelName: string): DiscussionChannel | undefined {
        return this.roomChannel.name === channelName
            ? this.roomChannel
            : this.availableDiscussionChannels.find((discussionChannel: DiscussionChannel) => discussionChannel.name === channelName);
    }
}
