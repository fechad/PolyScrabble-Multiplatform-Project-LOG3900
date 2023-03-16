import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SocketEvent } from '@app/enums/socket-event';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent extends PageCommunicationManager implements OnInit {
    @ViewChild('playArea') child: PlayAreaComponent;
    chatForm: FormGroup;
    nbHints: number;
    hintValue: number;
    currentHint: number;
    hints: string[];
    constructor(
        protected socketService: SocketClientService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        private router: Router,
        private dialog: MatDialog,
        public playerService: PlayerService,
    ) {
        super(socketService);
        this.hintValue = 0;
        this.currentHint = 0;
    }

    get room(): Room {
        return this.playerService.room;
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    get chatHistory(): FormArray {
        return this.chatForm.get('chatHistory') as FormArray;
    }

    ngOnInit() {
        this.connectSocket();
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
        // TODO: see with charge if it is ok to not remove focus on game page click
        if (event) return;
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

    showHint() {
        if (!this.hints) return;
        const args = this.hints[this.currentHint % (this.hints.length - 2)];
        const test = args.split('_');
        const value = test.pop();
        if (value) this.hintValue = parseInt(value, 10);
        this.child.showHint();
        this.currentHint++;
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.Reconnected, (data: { room: Room; player: Player }) => {
            this.room.setRoom(data.room);
            this.playerService.player.setPlayerGameAttributes(data.player);
            this.sessionStorageService.setItem('data', JSON.stringify({ socketId: data.player.socketId, roomName: data.room.roomInfo.name }));
        });
        this.socketService.on('hint', (data: { text: string }) => {
            if (data.text === '0') {
                this.nbHints = 0;
                return;
            }
            this.hints = data.text.split(' ');
            this.nbHints = parseInt(this.hints[this.hints.length - 1], 10);
        });
        this.socketService.on(SocketEvent.PlayerTurnChanged, () => {
            this.hintValue = 0;
            this.hintCommand();
        });
    }
}
