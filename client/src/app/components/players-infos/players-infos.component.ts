import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { EndGamePopupComponent } from '@app/components/endgame-popup/endgame-popup.component';
import { BASE_TEN, MINUTE_IN_SECOND } from '@app/constants/constants';
import { RACK_CAPACITY } from '@app/constants/rack-constants';
import { ThemedPseudos } from '@app/constants/themed-mode-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { AudioService } from '@app/services/audio.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';
import confetti from 'canvas-confetti';
import { lastValueFrom } from 'rxjs';

const END_GAME_WIDTH = '400px';
const BASE_AVATAR_PATH = 'assets/images/avatars/';
@Component({
    selector: 'app-players-infos',
    templateUrl: './players-infos.component.html',
    styleUrls: ['./players-infos.component.scss'],
})
export class PlayersInfosComponent extends ComponentCommunicationManager implements OnInit {
    @Input() inputSideNav: MatSidenav;
    lettersBankCount: number;
    remainingTime: number;
    currentPlayerTurnPseudo: string;
    winnerPseudo: string;
    numberOfWinner: number;
    opponentsInfo: ClientAccountInfo[];

    constructor(
        protected socketService: SocketClientService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        public playerService: PlayerService,
        private dialog: MatDialog,
        private httpService: HttpService,
        private audioService: AudioService,
    ) {
        super(socketService);
        this.room.roomInfo.isGameOver = false;
        this.opponentsInfo = [];
        this.getOpponentsInfo();
    }

    get isActivePlayer(): boolean {
        return this.playerService.player.isItsTurn;
    }

    get room(): Room {
        return this.playerService.room;
    }

    get min(): number {
        return parseInt(`${this.remainingTime / MINUTE_IN_SECOND}`, BASE_TEN);
    }

    get sec(): number {
        return parseInt(`${this.remainingTime % MINUTE_IN_SECOND}`, BASE_TEN);
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    get dictionary(): string {
        if (!this.room) return '';
        return this.room.roomInfo.dictionary;
    }

    ngOnInit() {
        this.connectSocket();
        this.remainingTime = 0;
    }

    launchConfetti() {
        confetti({
            particleCount: 200,
            spread: 200,
        });
    }

    getPlayer(pseudo: string): Player | undefined {
        const player = this.room.players.find((element) => element.pseudo === pseudo);
        return player;
    }

    async getOpponentsInfo() {
        if (this.opponentsInfo.length !== 0) return;

        for (const p of this.room.players) {
            if (p.pseudo === this.playerService.account.username) {
                this.opponentsInfo.push(this.playerService.account);
                continue;
            }
            if (this.room.roomInfo.isSolo) {
                this.getBotInfo();
                continue;
            }
            const res = await lastValueFrom(this.httpService.getOpponentInfo(p.pseudo));
            this.opponentsInfo.push(res);
        }
    }

    getPlayerInfo(isClient: boolean, info: string): string | number {
        const wantedPlayer = isClient
            ? this.room.players.find((player) => player.pseudo === this.playerService.player.pseudo)
            : this.room.players.find((player) => player.pseudo !== this.playerService.player.pseudo);

        let infoToReturn: string | number = '';
        switch (info) {
            case 'pseudo':
                infoToReturn = wantedPlayer ? wantedPlayer.pseudo : '';
                break;
            case 'score':
                infoToReturn = wantedPlayer ? wantedPlayer.points : 0;
                break;
        }
        return infoToReturn;
    }
    getPlayerAvatarUrl(username: string): string | undefined {
        const wantedPlayer = this.opponentsInfo.find((player) => player.username === username);
        return wantedPlayer?.userSettings.avatarUrl;
    }
    showEndGameDialog() {
        const description: InformationalPopupData = {
            header: 'Dommage...',
            body: 'Tres belle partie! Malheuresement, la victoire revient à ' + this.winnerPseudo,
        };
        this.dialog.open(EndGamePopupComponent, {
            width: END_GAME_WIDTH,
            autoFocus: true,
            data: description,
        });
    }

    changePlayerTurn() {
        this.socketService.send(SocketEvent.Message, '!passer');
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.LettersBankCountUpdated, (lettersBankCount: number) => {
            this.lettersBankCount = lettersBankCount;
            if (lettersBankCount < RACK_CAPACITY) {
                this.room.isBankUsable = false;
            }
        });
        this.socketService.on(SocketEvent.ToggleAngryBotAvatar, (botName: string) => {
            const bot = this.opponentsInfo.find((entry: ClientAccountInfo) => entry.username === botName);
            if (!bot) return;
            const currentAvatar = bot.userSettings.avatarUrl;
            bot.userSettings.avatarUrl = currentAvatar.startsWith(BASE_AVATAR_PATH + 'angry')
                ? BASE_AVATAR_PATH + bot.username + 'Avatar.png'
                : BASE_AVATAR_PATH + 'angry' + bot.username + 'Avatar.png';
        });
        this.socketService.on(SocketEvent.PlayerTurnChanged, (currentPlayerTurnPseudo: string) => {
            if (this.playerService.player.isItsTurn) {
                this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            }
            this.currentPlayerTurnPseudo = currentPlayerTurnPseudo;
            this.playerService.player.isItsTurn = this.playerService.player.pseudo === currentPlayerTurnPseudo;
        });

        this.socketService.on(SocketEvent.TimeUpdated, (room: Room) => {
            this.remainingTime = Math.max(+room.roomInfo.timerPerTurn - room.elapsedTime, 0);
        });

        this.socketService.on(SocketEvent.PlayerLeft, () => {
            this.sessionStorageService.removeItem('data');
        });

        this.socketService.on(SocketEvent.GameIsOver, (winnerArray: Player[]) => {
            this.room.roomInfo.isGameOver = true;
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            this.setPlayersTurnToFalse();
            this.findWinner(winnerArray);
        });

        this.socketService.on(SocketEvent.UpdatePlayerScore, (player: Player) => {
            const playerToUpdate = this.getPlayer(player.pseudo);
            if (!playerToUpdate) return;
            playerToUpdate.points = player.points;
        });

        this.socketService.on(SocketEvent.BotJoinedRoom, (players: Player[]) => {
            this.room.players = players;
        });
    }

    private setPlayersTurnToFalse() {
        for (const player of this.room.players) {
            player.isItsTurn = false;
        }
    }

    private findWinner(winnerArray: Player[]) {
        if (!winnerArray || winnerArray.length === 0) return;
        if (winnerArray.length <= 1) {
            this.winnerPseudo = winnerArray[0].pseudo;
        }
        this.numberOfWinner = winnerArray.length;
        if (this.getPlayerInfo(true, 'pseudo') === this.winnerPseudo || this.numberOfWinner === 2) this.launchConfetti();
        else this.showEndGameDialog();
        const firstWinner = this.opponentsInfo.find((player) => player.username === winnerArray[0].pseudo);
        if (!firstWinner) return;
        this.audioService.playWinnerMusic(firstWinner?.userSettings.victoryMusic as string);
    }
    private getBotInfo() {
        const bot = this.room.players.filter((entry: Player) => entry.pseudo !== this.playerService.account.username)[0];
        let avatarPath = BASE_AVATAR_PATH;
        const index = ThemedPseudos.findIndex((entry) => entry === bot.pseudo);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        avatarPath += index === -1 ? 'default' : bot.pseudo;
        avatarPath += 'Avatar.png';
        const info: ClientAccountInfo = {
            username: bot.pseudo,
            email: '',
            userSettings: { avatarUrl: avatarPath, defaultLanguage: 'french', defaultTheme: 'dark', victoryMusic: 'Better.mp3' },
            highscores: {},
            progressInfo: { totalXP: 9999, currentLevel: 999, currentLevelXp: 999, xpForNextLevel: 1000, victoriesCount: 69 },
            badges: [],
            bestGames: [],
            gamesPlayed: [],
            gamesWon: 69,
        };
        this.opponentsInfo.push(info);
    }
}
