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
    @ViewChild('chatMenu', { static: false }) private chatMenu!: ElementRef<HTMLDivElement>;
    @ViewChild('chatContainer', { static: false }) private chatContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuContainer', { static: false }) private menuContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('menuDarkBackground', { static: false }) private menuDarkBackground!: ElementRef<HTMLDivElement>;
    selectedDiscussionChannel: DiscussionChannel;
    availableDiscussionChannels: DiscussionChannel[];
    constructor(
        private playerService: PlayerService,
        public room: Room,
        private httpService: HttpService,
        private router: Router,
        protected socketService: SocketClientService,
        private dialog: MatDialog,
    ) {
        super(socketService);
        this.isWaitMultiPage = false;
        this.selectedDiscussionChannel = new DiscussionChannel('');
        this.availableDiscussionChannels = [];
    }

    get isGameCreator(): boolean {
        return this.room.roomInfo.creatorName === this.playerService.player.pseudo;
    }

    ngOnInit() {
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

    closeChat() {
        this.menuContainer.nativeElement.classList.remove('show');
        this.chatContainer.nativeElement.classList.remove('show');
    }

    updateAvailableChannels() {
        this.socketService.send(SocketEvent.GetDiscussionChannels);
    }

    leaveRoom() {
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

    async logOut() {
        if (environment.production) await lastValueFrom(this.httpService.logoutUser(this.playerService.player.pseudo));
        this.socketService.send(SocketEvent.LeaveChatChannel, { channel: 'General Chat', username: this.playerService.player.pseudo });
        this.playerService.player.pseudo = '';
        this.router.navigate(['/home']);
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
            this.availableDiscussionChannels = channels;
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

        this.socketService.send(SocketEvent.JoinChatChannel, { name: 'General Chat', user: this.playerService.player.pseudo });
        this.updateAvailableChannels();
    }

    private handleGameWaitPage() {
        if (!this.isWaitMultiPage) return;
        const gameRoomChat = this.getDiscussionChannelByName(this.room.roomInfo.name);
        if (!gameRoomChat) return;
        this.showChatChannel(this.availableDiscussionChannels.indexOf(gameRoomChat));
    }

    private getDiscussionChannelByName(channelName: string): DiscussionChannel | undefined {
        return this.availableDiscussionChannels.find((discussionChannel: DiscussionChannel) => discussionChannel.name === channelName);
    }
}
