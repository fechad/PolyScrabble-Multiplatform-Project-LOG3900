import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { EndGamePopupComponent } from '@app/components/endgame-popup/endgame-popup.component';
import { BASE_TEN, MINUTE_IN_SECOND, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { RACK_CAPACITY } from '@app/constants/rack-constants';
import { ThemedPseudos } from '@app/constants/themed-mode-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { AudioService } from '@app/services/audio.service';
import { BackgroundService } from '@app/services/background-image.service';
import { LanguageService } from '@app/services/language.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';

import confetti from 'canvas-confetti';

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
    winnersPseudos: string[];
    opponentsInfo: ClientAccountInfo[];
    // eslint-disable-next-line no-undef
    timerInterval: NodeJS.Timer;
    constructor(
        protected socketService: SocketClientService,
        private sessionStorageService: SessionStorageService,
        public playerService: PlayerService,
        private dialog: MatDialog,
        private audioService: AudioService,
        protected languageService: LanguageService,
        protected backgroundService: BackgroundService,
        public objService: OutgameObjectivesService,
    ) {
        super(socketService);
        this.room.roomInfo.isGameOver = false;
        this.opponentsInfo = [];
        this.winnersPseudos = [];
        if (!this.room.roomInfo.isSolo) return;
        this.setBotInfo();
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
        if (!this.playerService.isObserver) return;
        this.currentPlayerTurnPseudo = this.room.players.find((player) => player.isItsTurn)?.clientAccountInfo.username || '';
        this.resetTimer(this.room.elapsedTime);
    }

    launchConfetti() {
        confetti({
            particleCount: 200,
            spread: 200,
        });
    }

    getPlayer(pseudo: string): Player | undefined {
        const player = this.room.players.find((element: Player) => element.clientAccountInfo.username === pseudo);
        return player;
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
        const wantedPlayer = this.room.players.find((player) => player.pseudo === username);
        return wantedPlayer?.clientAccountInfo.userSettings.avatarUrl;
    }

    showEndGameDialog() {
        const description: InformationalPopupData = {
            header: this.languageService.currentLanguage === 'fr' ? 'Dommage...' : 'Too bad...',
            body:
                this.languageService.currentLanguage === 'fr'
                    ? 'Tres belle partie! Malheureusement, la victoire revient à ' + this.getWinnersPseudos()
                    : 'Good game! Unfortunately, the winner is ' + this.getWinnersPseudos(),
        };

        if (this.playerService.isObserver) {
            description.header = this.languageService.currentLanguage === 'fr' ? 'La Partie est terminée!' : 'The game is over!';
            description.body =
                this.languageService.currentLanguage === 'fr'
                    ? 'La victoire revient à ' + this.getWinnersPseudos()
                    : 'The winner is ' + this.getWinnersPseudos();
        }
        this.dialog.open(EndGamePopupComponent, {
            width: END_GAME_WIDTH,
            autoFocus: true,
            data: description,
        });
    }

    getWinnersPseudos() {
        if (this.winnersPseudos.length === 1) return this.winnersPseudos[0];
        let winnersPseudosText = '';
        for (let i = 0; i < this.winnersPseudos.length; i++) {
            if (i === this.winnersPseudos.length - 1) {
                winnersPseudosText +=
                    this.languageService.currentLanguage === 'fr' ? `et ${this.winnersPseudos[i]}` : `and ${this.winnersPseudos[i]}`;
                continue;
            }
            winnersPseudosText += `${this.winnersPseudos[i]}, `;
        }
        return winnersPseudosText;
    }

    changePlayerTurn() {
        this.socketService.send(SocketEvent.Message, '!passer');
    }

    async showSummary(player: Player) {
        if (player.avatarUrl.includes('assets')) return;
        if (player.avatarUrl.includes('robot-avatar')) return;
        await this.playerService.setPlayerToShow(player.clientAccountInfo);
        this.showTarget();
        this.inputSideNav.toggle();
    }

    showTarget() {
        const playerToShow = this.playerService.playerToShow;
        this.objService.objectives = [];
        if (!playerToShow || !this.playerService.playerToShowStat) return;
        this.objService.generateObjectives(this.playerService.playerToShowStat, playerToShow);
    }

    resetTimer(elapsedTime?: number) {
        this.remainingTime = +this.room.roomInfo.timerPerTurn;
        if (elapsedTime) this.remainingTime -= elapsedTime;

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.remainingTime <= 0) {
                clearInterval(this.timerInterval);
                return;
            }
            ++this.room.elapsedTime;
            this.remainingTime--;
        }, ONE_SECOND_IN_MS);
    }

    endTimer() {
        clearInterval(this.timerInterval);
        this.remainingTime = 0;
        this.room.elapsedTime = 0;
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.LettersBankCountUpdated, (lettersBankCount: number) => {
            this.lettersBankCount = lettersBankCount;
            if (lettersBankCount < RACK_CAPACITY) {
                this.room.isBankUsable = false;
            }
        });
        this.socketService.on(SocketEvent.ToggleAngryBotAvatar, (botName: string) => {
            const bot = this.room.players.find((player: Player) => player.pseudo === botName);
            if (!bot) return;
            this.toggleAvatar(bot.clientAccountInfo);
            this.toggleBotMusic(bot.clientAccountInfo);
            this.backgroundService.switchToAngry();
        });
        this.socketService.on(SocketEvent.PlayerTurnChanged, (currentPlayerTurnPseudo: string) => {
            this.currentPlayerTurnPseudo = currentPlayerTurnPseudo;
            this.playerService.player.isItsTurn = this.playerService.player.pseudo === currentPlayerTurnPseudo;
            this.resetTimer();
        });

        this.socketService.on(SocketEvent.PlayerLeft, () => {
            this.sessionStorageService.removeItem('data');
        });

        this.socketService.on(SocketEvent.GameIsOver, (winnerArray: Player[]) => {
            this.room.roomInfo.isGameOver = true;
            this.endTimer();
            this.setPlayersTurnToFalse();
            this.findWinner(winnerArray);
        });

        this.socketService.on(SocketEvent.UpdatePlayerScore, (player: Player) => {
            const playerToUpdate = this.getPlayer(player.clientAccountInfo.username);
            if (!playerToUpdate) return;
            playerToUpdate.points = player.points;
        });

        this.socketService.on(SocketEvent.BotJoinedRoom, (players: Player[]) => {
            this.room.setPlayers(players);
        });
    }
    private toggleAvatar(bot: ClientAccountInfo) {
        const currentAvatar = bot.userSettings.avatarUrl;
        bot.userSettings.avatarUrl = currentAvatar.startsWith(BASE_AVATAR_PATH + 'angry')
            ? BASE_AVATAR_PATH + bot.username + 'Avatar.png'
            : BASE_AVATAR_PATH + 'angry' + bot.username + 'Avatar.png';
    }
    private toggleBotMusic(bot: ClientAccountInfo) {
        const currentAvatar = bot.userSettings.avatarUrl;
        if (currentAvatar.startsWith(BASE_AVATAR_PATH + 'angry')) return this.audioService.playWinnerMusic('Better.mp3');
        this.audioService.playBotThemeMusic(bot.username, 0);
    }
    private setPlayersTurnToFalse() {
        for (const player of this.room.players) {
            player.isItsTurn = false;
        }
    }

    private findWinner(winnerArray: Player[]) {
        if (!winnerArray || winnerArray.length === 0) return;
        this.winnersPseudos = winnerArray.map((winner) => winner.clientAccountInfo.username);
        if (this.winnersPseudos.includes(this.getPlayerInfo(true, 'pseudo') as string)) this.launchConfetti();
        else this.showEndGameDialog();
        const firstWinner = this.room.players.find((player) => player.clientAccountInfo.username === winnerArray[0].clientAccountInfo.username);
        if (!firstWinner) return;
        this.audioService.playWinnerMusic(firstWinner?.clientAccountInfo.userSettings.victoryMusic as string);
    }

    private setBotInfo() {
        const bot = this.room.players.filter((entry: Player) => entry.pseudo !== this.playerService.account.username)[0];
        let avatarPath = BASE_AVATAR_PATH;
        const index = ThemedPseudos.findIndex((entry) => entry === bot.pseudo);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        avatarPath += index === -1 ? 'default' : bot.pseudo;
        avatarPath += 'Avatar.png';
        bot.clientAccountInfo = {
            username: bot.pseudo,
            email: '',
            userSettings: { avatarUrl: avatarPath, defaultLanguage: 'french', defaultTheme: 'dark', victoryMusic: 'Better.mp3' },
            highScores: {},
            progressInfo: { totalXP: 9999, currentLevel: 999, currentLevelXp: 999, xpForNextLevel: 1000, victoriesCount: 69 },
            badges: [],
            bestGames: [],
            gamesPlayed: [],
            gamesWon: 69,
        };
    }
}
