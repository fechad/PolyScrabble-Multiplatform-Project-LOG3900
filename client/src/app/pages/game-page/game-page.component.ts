import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/confirmation-popup/confirmation-popup.component';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(
        private socketService: SocketClientService,
        private socketServiceBot: SocketClientBotService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        private router: Router,
        private dialog: MatDialog,
        public room: Room,
        public player: Player,
    ) {}

    ngOnInit() {
        this.connect();
        const session = this.sessionStorageService.getPlayerData('data');
        if (this.room.roomInfo.name === '') {
            this.socketService.send('reconnect', { socketId: session.socketId, roomName: session.roomName });
            return;
        }
        this.startGame();
        this.sessionStorageService.setItem('data', JSON.stringify({ socketId: this.socketService.socket.id, roomName: this.room.roomInfo.name }));
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        this.focusHandlerService.currentFocus.next(CurrentFocus.NONE);
    }

    startGame() {
        this.socketService.send('startGame');
    }

    helpCommand() {
        this.socketService.send('message', '!aide');
    }

    hintCommand() {
        this.socketService.send('message', '!indice');
    }

    letterBankCommand() {
        this.socketService.send('message', '!réserve');
    }

    leaveGame() {
        this.socketService.disconnect();
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
    goBackToHome() {
        this.router.navigate(['/home']);
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    private connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        if (!this.socketServiceBot.isSocketAlive()) {
            this.socketServiceBot.connect();
        }
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('reconnected', (data: { room: Room; player: Player }) => {
            this.setRoom(data.room);
            this.setPlayer(data.player);
            this.sessionStorageService.setItem('data', JSON.stringify({ socketId: data.player.socketId, roomName: data.room.roomInfo.name }));
        });
    }

    private setRoom(roomServer: Room) {
        this.room.roomInfo.name = roomServer.roomInfo.name;
        this.room.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.room.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.room.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.room.roomInfo.maxPlayers = roomServer.roomInfo.maxPlayers;
        this.room.players = roomServer.players;
        this.room.elapsedTime = roomServer.elapsedTime;
    }

    private setPlayer(player: Player) {
        this.player.pseudo = player.pseudo;
        this.player.socketId = player.socketId;
        this.player.points = player.points;
        this.player.isCreator = player.isCreator;
        this.player.isItsTurn = player.isItsTurn;
    }
}
