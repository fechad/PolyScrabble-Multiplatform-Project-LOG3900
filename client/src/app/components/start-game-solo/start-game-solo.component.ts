import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GameData } from '@app/classes/game-data';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { HttpService } from '@app/http.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-start-game-solo',
    templateUrl: './start-game-solo.component.html',
    styleUrls: ['./start-game-solo.component.scss'],
})
export class StartGameSoloComponent implements OnInit {
    @Input() gameData: GameData | undefined;
    @Input() botName: string;
    @Input() gameForm: FormGroup | undefined;
    @Output() private dictionaryDeleted;
    @Output() private httpError;
    onProcess: boolean;
    constructor(
        private socketService: SocketClientService,
        private socketServiceBot: SocketClientBotService,
        private router: Router,
        public room: Room,
        public player: Player,
        private httpService: HttpService,
    ) {
        this.dictionaryDeleted = new EventEmitter<void>();
        this.httpError = new EventEmitter<void>();
    }

    ngOnInit() {
        this.connect();
    }

    connect() {
        if (this.socketService.isSocketAlive()) {
            this.socketService.disconnect();
        }
        if (this.socketServiceBot.isSocketAlive()) {
            this.socketServiceBot.disconnect();
        }
        this.socketService.connect();
        this.socketServiceBot.connect();
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('joinRoomSoloStatus', (serverRoomName: string) => {
            this.onProcess = false;
            if (!serverRoomName.startsWith('Room')) return;
            this.room.roomInfo.name = serverRoomName;
            this.socketServiceBot.send('joinRoomSoloBot', {
                roomName: serverRoomName,
                botName: this.botName,
                isExpertLevel: this.gameData?.isExpertLevel || false,
            });
        });
        this.socketService.on('botInfos', (bot: Player) => {
            this.room.players[1] = bot;
            this.router.navigate(['/game']);
        });
    }

    setRoomInfo(pseudo: string): void {
        if (!this.gameData) return;
        const timerPerTurn = this.gameData.timerPerTurn;
        const dictionary = this.gameData.dictionary;
        this.room.currentPlayerPseudo = pseudo;
        this.room.roomInfo.timerPerTurn = timerPerTurn;
        this.room.roomInfo.dictionary = dictionary;
        this.room.roomInfo.isSolo = true;
    }

    setPlayerInfo(pseudo: string): void {
        this.player.pseudo = pseudo;
        this.player.isCreator = true;
        this.player.socketId = this.socketService.socket.id;
        this.room.players = [this.player];
    }

    async joinRoom() {
        if (!this.gameData || !this.hasValidGameType) return;
        if (!this.dictionaryExists()) return;
        const dictionary = this.gameData.dictionary;
        await this.dictionarySelectedExists(dictionary);
        if (this.httpService.anErrorOccurred()) {
            this.handleHttpError();
            return;
        }
        const pseudo = this.gameData.pseudo;
        this.setRoomInfo(pseudo);
        this.setPlayerInfo(pseudo);
        this.onProcess = true;
        this.socketService.send('joinRoomSolo', this.room);
    }

    get hasValidGameType(): boolean {
        return ['classic', 'log2990'].includes(this.room.roomInfo.gameType);
    }

    get isFormValid(): boolean {
        if (!this.gameForm) return false;
        return this.gameForm.valid && this.isDictionarySelected();
    }

    private dictionaryExists(): boolean {
        if (!this.gameData) return false;
        return this.gameData.dictionary !== '';
    }
    private handleHttpError() {
        if (this.httpService.getErrorMessage() !== GONE_RESSOURCE_MESSAGE) {
            this.httpError.emit();
            return;
        }
        this.dictionaryDeleted.emit();
        return;
    }

    private isDictionarySelected(): boolean {
        if (!this.gameData) return false;
        const dictionary = this.gameData.dictionary;
        if (!dictionary) return false;
        return true;
    }

    private async dictionarySelectedExists(title: string): Promise<boolean> {
        const dictionary = await lastValueFrom(this.httpService.getDictionary(title, false));
        return dictionary?.title === title;
    }
}
