import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { DEFAULT_DICTIONARY_TITLE } from '@app/components/dictionaries-table/dictionaries-table.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { MAX_LENGTH_PSEUDO, MINUTE_IN_SECOND, MIN_LENGTH_PSEUDO, TIMER_MULTIPLE } from '@app/constants/constants';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { GameMode } from '@app/enums/game-mode';
import { SocketEvent } from '@app/enums/socket-event';
import { Bot } from '@app/interfaces/bot';
import { Dictionary } from '@app/interfaces/dictionary';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-multiplayer-page',
    templateUrl: './game-create-multiplayer-page.component.html',
    styleUrls: ['./game-create-multiplayer-page.component.scss', '../dark-theme.scss'],
})
export class GameCreateMultiplayerPageComponent extends PageCommunicationManager implements AfterViewInit, OnInit {
    gameForm: FormGroup;
    mode: GameMode;
    botName: string;
    botNames: string[];
    bots: Bot[];
    dictionaries: Dictionary[];
    onProcess: boolean;
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        public room: Room,
        private playerService: PlayerService,
        protected socketService: SocketClientService,
        private httpService: HttpService,
        private dialog: MatDialog,
    ) {
        super(socketService);
        this.gameForm = this.fb.group({
            timerPerTurn: ['', [Validators.required, this.multipleValidator(TIMER_MULTIPLE)]],
            dictionary: ['', Validators.required],
            level: ['', Validators.required],
            roomPassword: [''],
            isPublic: [''],
            botName: [''],
        });
        this.dictionaries = [];
        this.onProcess = false;
    }

    get hasValidGameType(): boolean {
        return ['classic', 'log2990'].includes(this.room.roomInfo.gameType);
    }

    get isFormValid(): boolean {
        return this.gameForm.valid;
    }

    get isSolo(): boolean {
        return this.mode === GameMode.Solo;
    }

    get beginners(): Bot[] {
        return this.bots.filter((bot) => bot.gameType === 'débutant');
    }

    get experts(): Bot[] {
        return this.bots.filter((bot) => bot.gameType === 'expert');
    }

    get selectedDictionary(): string {
        return (this.gameForm.controls.dictionary as FormControl).value;
    }

    get isServerUnreachable(): boolean {
        return this.httpService.getErrorMessage() === UNREACHABLE_SERVER_MESSAGE;
    }

    ngOnInit() {
        this.connectSocket();

        this.mode = this.route.snapshot.params.mode as GameMode;
        if (this.isSolo) {
            this.gameForm = this.fb.group({
                pseudo: [
                    this.playerService.player.pseudo,
                    [
                        Validators.required,
                        this.notEqual(this.botName),
                        Validators.minLength(MIN_LENGTH_PSEUDO),
                        Validators.maxLength(MAX_LENGTH_PSEUDO),
                    ],
                ],
                timerPerTurn: [MINUTE_IN_SECOND, [Validators.required, this.multipleValidator(TIMER_MULTIPLE)]],
                dictionary: [DEFAULT_DICTIONARY_TITLE],
                level: ['beginner', Validators.required],
            });
        }
    }

    setPlaceholderAsLabel(labelElement: HTMLLabelElement) {
        labelElement.classList.remove('placeholder');
    }

    setLabelAsPlaceholder(labelElement: HTMLLabelElement, formControlName: string) {
        if (this.gameForm.get(formControlName)?.value) return;
        labelElement.classList.add('placeholder');
    }

    focusInput(inputElement: HTMLSelectElement | HTMLInputElement) {
        inputElement.focus();
    }

    async ngAfterViewInit() {
        await this.handleRefresh();

        this.botNames = this.beginners.map((bot) => bot.name);

        const randIndex = Math.floor(Math.random() * this.botNames.length);
        this.botName = this.botNames[randIndex];
    }

    async handleRefresh() {
        await this.updateBots();
        await this.updateDictionaries();
        this.selectDefaultDictionary();
    }

    async updateBots() {
        const updateBots = await lastValueFrom(this.httpService.getAllBots());
        if (this.httpService.anErrorOccurred()) {
            this.bots = [];
            return;
        }
        this.bots = updateBots;
    }

    createRoom() {
        if (this.onProcess) return;
        this.initializeRoom();
        this.onProcess = true;
        this.socketService.send(SocketEvent.CreateRoom, this.room);
    }

    multipleValidator(multiple: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: unknown } | null => {
            if (control.value % multiple !== 0) {
                return { notMultipleOfValue: true };
            } else {
                return null;
            }
        };
    }

    notEqual(value: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            if (control.value === value) {
                return { notEqual: true };
            } else {
                return null;
            }
        };
    }

    // TODO: remove
    async handleDictionaryDeleted() {
        this.showErrorDialog(`Le dictionnaire "${this.selectedDictionary}" n'existe plus sur notre serveur`);
        await this.handleRefresh();
    }

    handleHttpError() {
        this.showErrorDialog(this.httpService.getErrorMessage());
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.RoomCreated, (serverRoomName: string) => {
            this.onProcess = false;
            if (!serverRoomName.startsWith('Room')) return;
            this.room.roomInfo.name = serverRoomName;
            this.socketService.send(SocketEvent.CreateChatChannel, {
                channel: serverRoomName,
                username: {
                    username: this.playerService.player.pseudo,
                    email: '',
                    avatarURL: '',
                    level: 0,
                    badges: [],
                    highScore: 0,
                    gamesWon: 0,
                    totalXp: 0,
                    gamesPlayed: [],
                    bestGames: [],
                },
            });
            this.router.navigate(['/game/multiplayer/wait']);
        });
    }

    private initializeRoom() {
        this.room.currentPlayerPseudo = this.playerService.player.pseudo;
        this.room.roomInfo.timerPerTurn = this.gameForm.controls.timerPerTurn.value;
        this.room.roomInfo.dictionary = this.gameForm.controls.dictionary.value;
        this.room.roomInfo.isSolo = this.isSolo;
        this.room.roomInfo.creatorName = this.playerService.player.pseudo;
        if (this.gameForm.controls.isPublic.value) {
            this.room.roomInfo.isPublic = true;
            this.room.roomInfo.password = this.gameForm.controls.roomPassword.value;
        } else {
            this.room.roomInfo.isPublic = false;
        }
        this.playerService.player.isCreator = true;
        this.playerService.player.socketId = this.socketService.socket.id;
        this.room.players = [this.playerService.player];
    }

    private showErrorDialog(message: string) {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: message,
        });
    }

    // TODO: refactor dictionaries use
    private async updateDictionaries() {
        const dictionaries = await lastValueFrom(this.httpService.getAllDictionaries());
        this.resetDefaultDictionary();
        if (this.httpService.anErrorOccurred()) {
            this.dictionaries = [];
            return;
        }
        this.dictionaries = dictionaries;
    }

    private selectDefaultDictionary() {
        const defaultDictionary = this.dictionaries.find((dictionary) => dictionary.title === DEFAULT_DICTIONARY_TITLE);
        if (!defaultDictionary) {
            this.resetDefaultDictionary();
            return;
        }
        this.gameForm.controls.dictionary.setValue(defaultDictionary.title);
    }

    private resetDefaultDictionary() {
        if (!this.gameForm || !this.gameForm.controls.dictionary) return;
        this.gameForm.controls.dictionary.setValue('');
    }
}
