import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameData } from '@app/classes/game-data';
import { Room } from '@app/classes/room';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { GameDataService } from '@app/services/game-data.service';
import { HttpService } from '@app/services/http.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-wait-multiplayer-page',
    templateUrl: './game-wait-multiplayer-page.component.html',
    styleUrls: ['./game-wait-multiplayer-page.component.scss'],
    providers: [],
})
export class GameWaitMultiplayerPageComponent implements OnInit {
    otherPlayerExist: boolean;
    playerName: string;
    gameData: GameData;
    dictionaryExistsOnServer: boolean;
    constructor(
        private socketService: SocketClientService,
        public room: Room,
        public gameDataService: GameDataService,
        private httpService: HttpService,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.otherPlayerExist = false;
        this.playerName = this.room.currentPlayerPseudo;
        this.gameData = this.gameDataService.data;
        this.dictionaryExistsOnServer = true;
    }

    get firstPlayerPseudo(): string {
        return this.room.players[0] ? this.room.players[0].pseudo : '';
    }

    get secondPlayerPseudo(): string {
        return this.room.players[1] ? this.room.players[1].pseudo : '';
    }

    get roomStatusText(): string {
        if (this.otherPlayerExist) return `${this.room.players[1].pseudo} à rejoint votre partie, démarrez ou rejetez`;
        return 'Vous êtes en attente...';
    }

    ngOnInit() {
        this.connect();
    }

    leaveRoom() {
        this.socketService.send(SocketEvent.LeaveRoomCreator, this.room.roomInfo.name);
        this.rejectPlayer();
    }

    async acceptPlayer() {
        await this.dictionarySelectedStillExists(this.room.roomInfo.dictionary);
        if (this.httpService.anErrorOccurred()) {
            this.handleHttpError();
            return;
        }
        this.room.currentPlayerPseudo = this.playerName;
        this.socketService.send(SocketEvent.AcceptPlayer, this.room);
        this.router.navigate(['/game']);
    }

    rejectPlayer() {
        this.socketService.send(SocketEvent.RejectPlayer, this.room);
    }

    onGoToSolo() {
        this.socketService.send(SocketEvent.LeaveRoomCreator, this.room.roomInfo.name);
    }

    private handleHttpError() {
        if (this.isDictionaryDeleted()) {
            this.dictionaryExistsOnServer = false;
            this.leaveRoom();
            this.rejectPlayer();
            this.showErrorDialog(this.generateDeleteDictionaryMessage());
            return;
        }
        this.showErrorDialog(this.httpService.getErrorMessage());
        return;
    }

    private generateDeleteDictionaryMessage() {
        return `Malheureusement, le dictionnaire "${this.room.roomInfo.dictionary}" de votre partie n'existe plus sur notre serveur.
        Par conséquent, cette partie ne peut pas être lancée.`;
    }
    private showErrorDialog(message: string) {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: message,
        });
    }
    private isDictionaryDeleted(): boolean {
        return this.httpService.getErrorMessage() === GONE_RESSOURCE_MESSAGE;
    }
    private async dictionarySelectedStillExists(title: string): Promise<boolean> {
        const dictionary = await lastValueFrom(this.httpService.getDictionary(title, false));
        return dictionary?.title === title;
    }

    private connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.PlayerFound, (room: Room) => {
            this.room.players = room.players;
            this.otherPlayerExist = true;
        });

        this.socketService.on(SocketEvent.PlayerLeft, () => {
            sessionStorage.removeItem('data');
            const playerToRemove = this.room.players[1];
            if (playerToRemove) {
                this.room.players.splice(this.room.players.indexOf(playerToRemove), 1);
            }
            this.otherPlayerExist = false;

            this.socketService.send(SocketEvent.SetRoomAvailable, this.room.roomInfo.name);
        });
    }
}
