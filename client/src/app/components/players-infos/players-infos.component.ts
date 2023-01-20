import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { EndGamePopupComponent } from '@app/components/endgame-popup/endgame-popup.component';
import { BASE_TEN, MAX_RECONNECTION_DELAY, MINUTE_IN_SECOND, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { Bot } from '@app/interfaces/bot';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { HttpService } from '@app/services/http.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';
const END_GAME_WIDTH = '400px';
@Component({
    selector: 'app-players-infos',
    templateUrl: './players-infos.component.html',
    styleUrls: ['./players-infos.component.scss'],
})
export class PlayersInfosComponent implements OnInit {
    remainingTime: number;
    currentPlayerTurnPseudo: string;
    winnerPseudo: string;
    numberOfWinner: number;
    bot: Player;
    bots: Bot[];
    constructor(
        private socketService: SocketClientService,
        private socketClientBotService: SocketClientBotService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        private httpService: HttpService,
        public room: Room,
        public player: Player,
        private dialog: MatDialog,
    ) {
        this.room.roomInfo.isGameOver = false;
        if (this.room.players.length >= 2) this.bot = this.room.players[1];
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
    get beginners(): Bot[] {
        return this.bots.filter((e) => e.gameType === 'débutant');
    }

    get experts(): Bot[] {
        return this.bots.filter((e) => e.gameType === 'expert');
    }

    get dictionary(): string {
        if (!this.room) return '';
        return this.room.roomInfo.dictionary;
    }

    ngOnInit() {
        this.connect();
        this.remainingTime = 0;
        this.handleRefresh();
    }

    async handleRefresh() {
        const updateBots = await lastValueFrom(this.httpService.getAllBots());
        if (this.httpService.anErrorOccurred()) {
            this.bots = [];
            return;
        }
        this.bots = updateBots;
    }

    getPlayer(pseudo: string): Player | undefined {
        const player = this.room.players.find((element) => element.pseudo === pseudo);
        return player;
    }

    getPlayerInfo(isClient: boolean, info: string): string | number {
        const wantedPlayer = isClient
            ? this.room.players.find((player) => player.pseudo === this.player.pseudo)
            : this.room.players.find((player) => player.pseudo !== this.player.pseudo);

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
    showEndGameDialog() {
        const description: InformationalPopupData = {
            header: 'La partie est finie',
            body: 'Tres belle partie!',
        };
        this.dialog.open(EndGamePopupComponent, {
            width: END_GAME_WIDTH,
            autoFocus: true,
            data: description,
        });
    }

    private connect() {
        if (this.socketService.isSocketAlive() && this.socketClientBotService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
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
            if (this.socketService.isSocketAlive() && this.socketClientBotService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.socketService.send('getPlayerInfos', this.room.roomInfo.name);
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('playerTurnChanged', (currentPlayerTurnPseudo: string) => {
            if (this.player.isItsTurn) {
                this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            }
            this.currentPlayerTurnPseudo = currentPlayerTurnPseudo;
            this.player.isItsTurn = this.player.pseudo === currentPlayerTurnPseudo;
            if (this.room.roomInfo.isSolo && this.bot && this.bot.pseudo === currentPlayerTurnPseudo) {
                this.socketClientBotService.send('botPlayAction');
            }
        });

        this.socketService.on('timeUpdated', (room: Room) => {
            this.remainingTime = Math.max(+room.roomInfo.timerPerTurn - room.elapsedTime, 0);
        });

        this.socketService.on('playerLeft', (player: Player) => {
            const beginnersNames = this.beginners.map((e) => e.name);
            const botName = beginnersNames.filter((name) => name !== this.player.pseudo)[Math.floor(Math.random() * beginnersNames.length)];

            this.socketClientBotService.send('convertToRoomSoloBot', {
                roomName: this.room.roomInfo.name,
                botName,
                points: player.points,
            });

            this.sessionStorageService.removeItem('data');
        });

        this.socketService.on('gameIsOver', (winnerArray: Player[]) => {
            this.room.roomInfo.isGameOver = true;
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            this.setPlayersTurnToFalse();
            this.findWinner(winnerArray);
            this.showEndGameDialog();
        });

        this.socketService.on('updatePlayerScore', (player: Player) => {
            const playerToUpdate = this.getPlayer(player.pseudo);
            if (!playerToUpdate) return;
            playerToUpdate.points = player.points;
        });

        this.socketService.on('convertToRoomSoloBotStatus', () => {
            this.room.roomInfo.isSolo = true;
        });

        this.socketService.on('botInfos', (bot: Player) => {
            this.bot = bot;
            if (this.room.players.length === 1) {
                this.room.players.push(bot);
                return;
            }
            const playerToSwap = this.room.players.find((player) => player.pseudo !== this.player.pseudo);
            if (!playerToSwap) return;
            this.room.players[this.room.players.indexOf(playerToSwap)] = bot;
        });

        this.socketClientBotService.on('botPlayedAction', (message: string) => {
            this.socketClientBotService.send('message', message);
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
    }
}
