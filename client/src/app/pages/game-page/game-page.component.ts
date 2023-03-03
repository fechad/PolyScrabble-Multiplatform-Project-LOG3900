import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { SocketEvent } from '@app/enums/socket-event';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
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
        public playerService: PlayerService,
    ) {}

    get room(): Room {
        return this.playerService.room;
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    ngOnInit() {
        this.connect();
        const session = this.sessionStorageService.getPlayerData('data');
        if (this.room.roomInfo.name === '' && session) {
            this.socketService.send(SocketEvent.Reconnect, { socketId: session.socketId, roomName: session.roomName });
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
        this.socketService.send(SocketEvent.StartGame);
    }

    helpCommand() {
        this.socketService.send(SocketEvent.Message, '!aide');
    }

    hintCommand() {
        this.socketService.send(SocketEvent.Message, '!indice');
    }

    letterBankCommand() {
        this.socketService.send(SocketEvent.Message, '!réserve');
    }

    leaveGame() {
        this.socketService.disconnect();
        this.router.navigate(['/main']);
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
        this.router.navigate(['/main']);
    }

    private connect() {
        this.socketService.refreshConnection();
        // TODO why is configureBaseSocketFeatures called twice?
        this.configureBaseSocketFeatures();
        if (!this.socketServiceBot.isSocketAlive()) {
            this.socketServiceBot.connect();
        }
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.Reconnected, (data: { room: Room; player: Player }) => {
            this.room.setRoom(data.room);
            this.playerService.player.setPlayerGameAttributes(data.player);
            this.sessionStorageService.setItem('data', JSON.stringify({ socketId: data.player.socketId, roomName: data.room.roomInfo.name }));
        });
    }
}
