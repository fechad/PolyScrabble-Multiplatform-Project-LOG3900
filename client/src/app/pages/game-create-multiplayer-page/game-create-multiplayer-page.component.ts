import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { TIMER_MULTIPLE } from '@app/constants/constants';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { GameLevel } from '@app/enums/game-level';
import { GameMode } from '@app/enums/game-mode';
import { Language } from '@app/enums/language';
import { SocketEvent } from '@app/enums/socket-event';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

const DEFAULT_DICTIONARY_TITLE = 'dictionnaire par défaut';
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
        private router: Router,
        private playerService: PlayerService,
        protected socketService: SocketClientService,
        private httpService: HttpService,
        private dialog: MatDialog,
        protected themeService: ThemeService,
    ) {
        super(socketService);
        const DEFAULT_TIMER_PER_TURN = '60';
        const PUBLIC_GAME_VALUE = 1;
        this.gameForm = this.fb.group({
            timerPerTurn: [DEFAULT_TIMER_PER_TURN, [Validators.required, this.multipleValidator(TIMER_MULTIPLE)]],
            dictionary: [DEFAULT_DICTIONARY_TITLE, Validators.required],
            level: [GameLevel.Adaptative, Validators.required],
            botLanguage: [this.userLanguage, Validators.required],
            roomPassword: [''],
            isPublic: [PUBLIC_GAME_VALUE],
            botName: ['Simon'],
        });
        this.botNames = [];
        this.onProcess = false;
    }

    get gameLevel(): typeof GameLevel {
        return GameLevel;
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

    get userLanguage(): Language {
        return this.playerService.account.userSettings.defaultLanguage === 'french' ? Language.French : Language.English;
    }

    ngOnInit() {
        this.connectSocket();
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
        this.room.botsLevel = this.gameForm.controls.level.value;
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
            if (!serverRoom.roomInfo.name.startsWith('R-')) return;
            this.room.roomInfo.name = serverRoom.roomInfo.name;
            this.socketService.send(SocketEvent.CreateChatChannel, {
                channel: serverRoom.roomInfo.name,
                username: this.playerService.reducePLayerInfo(),
                isRoomChannel: true,
            });
            if (this.isSolo) {
                this.room.setPlayers(serverRoom.players);
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
        this.room.roomInfo.botLanguage = this.gameForm.controls.botLanguage.value;
        this.room.roomInfo.isSolo = this.isSolo;
        this.room.roomInfo.creatorName = this.playerService.player.pseudo;
        if (this.gameForm.controls.isPublic.value > 0) {
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
