import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { EndGamePopupComponent } from '@app/components/endgame-popup/endgame-popup.component';
import { BASE_TEN, MINUTE_IN_SECOND } from '@app/constants/constants';
import { SocketEvent } from '@app/enums/socket-event';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';
const END_GAME_WIDTH = '400px';
@Component({
    selector: 'app-players-infos',
    templateUrl: './players-infos.component.html',
    styleUrls: ['./players-infos.component.scss'],
})
export class PlayersInfosComponent extends ComponentCommunicationManager implements OnInit {
    remainingTime: number;
    currentPlayerTurnPseudo: string;
    winnerPseudo: string;
    numberOfWinner: number;
    constructor(
        protected socketService: SocketClientService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        public playerService: PlayerService,
        private dialog: MatDialog,
    ) {
        super(socketService);
        this.room.roomInfo.isGameOver = false;
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

    getPlayer(pseudo: string): Player | undefined {
        const player = this.room.players.find((element) => element.pseudo === pseudo);
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

    protected configureBaseSocketFeatures() {
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
            this.showEndGameDialog();
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
    }
}
