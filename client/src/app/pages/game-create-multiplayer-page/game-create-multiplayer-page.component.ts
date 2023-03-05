import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { DEFAULT_DICTIONARY_TITLE } from '@app/components/dictionaries-table/dictionaries-table.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { TIMER_MULTIPLE } from '@app/constants/constants';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { GameMode } from '@app/enums/game-mode';
import { SocketEvent } from '@app/enums/socket-event';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

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
    onProcess: boolean;
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private playerService: PlayerService,
        protected socketService: SocketClientService,
        private httpService: HttpService,
        private dialog: MatDialog,
    ) {
        super(socketService);
        this.gameForm = this.fb.group({
            timerPerTurn: ['', [Validators.required, this.multipleValidator(TIMER_MULTIPLE)]],
            dictionary: [DEFAULT_DICTIONARY_TITLE, Validators.required],
            level: ['', Validators.required],
            roomPassword: [''],
            isPublic: [''],
            botName: [''],
        });
        this.botNames = [];
        this.onProcess = false;
    }

    get room(): Room {
        return this.playerService.room;
    }

    get hasValidGameType(): boolean {
        return ['classic', 'log2990'].includes(this.room.roomInfo.gameType);
    }

    get isFormValid(): boolean {
        return this.gameForm.valid;
    }

    get isSolo(): boolean {
        return this.room.roomInfo.isSolo || false;
    }

    get selectedDictionary(): string {
        return (this.gameForm.controls.dictionary as FormControl).value;
    }

    get isServerUnreachable(): boolean {
        return this.httpService.getErrorMessage() === UNREACHABLE_SERVER_MESSAGE;
    }

    ngOnInit() {
        this.connectSocket();

        const gameMode = this.route.snapshot.params.mode as GameMode;
        this.room.roomInfo.isSolo = gameMode === GameMode.Solo;
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
        const randIndex = Math.floor(Math.random() * this.botNames.length);
        this.botName = this.botNames[randIndex];
    }

    createRoom() {
        if (this.onProcess) return;
        this.initializeRoom();
        this.onProcess = true;

        if (this.isSolo) {
            this.socketService.send(SocketEvent.CreateSoloRoom, {
                room: this.room,
                botName: this.gameForm.controls.botName.value,
                desiredLevel: this.gameForm.controls.level.value,
            });
            return;
        }
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

    handleHttpError() {
        this.showErrorDialog(this.httpService.getErrorMessage());
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.RoomCreated, (serverRoom: Room) => {
            this.onProcess = false;
            if (!serverRoom.roomInfo.name.startsWith('Room')) return;
            this.room.roomInfo.name = serverRoom.roomInfo.name;
            this.socketService.send(SocketEvent.CreateChatChannel, {
                channel: serverRoom.roomInfo.name,
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
                isRoomChannel: true,
            });
            if (this.isSolo) {
                this.room.players = serverRoom.players;
                this.router.navigate(['/game']);
                return;
            }
            this.router.navigate(['/game/multiplayer/wait']);
        });
    }

    // TODO: create roomMethod
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
}
