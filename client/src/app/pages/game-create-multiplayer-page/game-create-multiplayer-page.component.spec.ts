/* eslint-disable max-lines */
/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DEFAULT_DICTIONARY_TITLE } from '@app/components/dictionaries-table/dictionaries-table.component';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { Bot } from '@app/interfaces/bot';
import { Dictionary } from '@app/interfaces/dictionary';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';
import { GameCreateMultiplayerPageComponent } from './game-create-multiplayer-page.component';
import SpyObj = jasmine.SpyObj;

class ActivatedRouteMock {
    mode = '';
    get snapshot() {
        return new ActivatedRouteMock();
    }
    get params() {
        return new ActivatedRouteMock();
    }
}

describe('GameCreateMultiplayerPageComponent', () => {
    let component: GameCreateMultiplayerPageComponent;
    let fixture: ComponentFixture<GameCreateMultiplayerPageComponent>;
    let dialog: MatDialog;
    let formBuilder: FormBuilder;
    let routerSpy: SpyObj<Router>;
    let httpService: HttpService;
    let fakeBot: Bot;
    let fakeDictionary: Dictionary;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let playerService: PlayerService;
    let activatedRouteMock: any;

    beforeEach(async () => {
        formBuilder = new FormBuilder();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);
        playerService = new PlayerService();
        playerService.player.pseudo = 'player1';

        activatedRouteMock = new ActivatedRouteMock();
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [GameCreateMultiplayerPageComponent],
            providers: [
                { provide: FormBuilder, useValue: formBuilder },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: HttpService },
                { provide: PlayerService, useValue: playerService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreateMultiplayerPageComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialog = fixture.debugElement.injector.get(MatDialog);
        fakeBot = { name: 'BOTEGA', gameType: 'expert' };
        fakeDictionary = { title: 'english', description: 'simply the best' };
        fixture.detectChanges();
        spyOn(component as any, 'resetDefaultDictionary').and.callFake(() => {
            return;
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleRefresh() tests', () => {
        it('should call getAllBots', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            const spy = spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should open an error dialog when an HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const errorDialogSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });
        it('should NOT open an error when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const errorDialogSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });

        it('should update the bots dialog when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            component.bots = [];
            const serverBots: Bot[] = [fakeBot];
            spyOn(httpService, 'getAllBots').and.returnValue(of(serverBots));
            const errorOccurredSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorOccurredSpy).toHaveBeenCalled();
            expect(component.bots).toEqual(serverBots);
        });
        it('should communicate with the server to get all of the dictionaries', async () => {
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
        it('when an error occurs when getting the dictionaries, the list of dictionaries should be emptied', async () => {
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual([]);
        });
        it('When the server returns the default dictionary, the selected dictionary should be the default', async () => {
            const serverDictionaries: Dictionary[] = [{ title: DEFAULT_DICTIONARY_TITLE, description: '...' }];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            component.gameForm.controls.dictionary.setValue('Hipster words');
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
            expect(component.selectedDictionary).toEqual(DEFAULT_DICTIONARY_TITLE);
        });
        it('should be possible to selected a dictionary different from the default one (when it is not the only onen)', async () => {
            const serverDictionaries: Dictionary[] = [{ title: DEFAULT_DICTIONARY_TITLE, description: '...' }, fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            component.gameForm.controls.dictionary.setValue('Hipster words');
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.selectedDictionary).toEqual(DEFAULT_DICTIONARY_TITLE);
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
    });

    describe('timerPerTurn tests', () => {
        const notMultipleOf30 = 35;
        const multipleOf30 = 300;
        it('should not validate a number that is not multiple of 30', () => {
            const control: AbstractControl = component.gameForm.get('timerPerTurn') as AbstractControl;
            control.setValue(notMultipleOf30);
            expect(control.status).toEqual('INVALID');
        });
        it('should have multiple of 30 validator', () => {
            const control: AbstractControl = component.gameForm.get('timerPerTurn') as AbstractControl;
            control.setValue(multipleOf30);
            expect(control.status).toEqual('VALID');
        });
    });

    describe('notEqualValidator Bot tests', () => {
        const botName = 'bot A';
        const randomName = 'Sam';

        beforeEach(() => {
            component.gameForm = formBuilder.group({
                pseudo: ['', [component.notEqual(botName)]],
            });
        });

        it('should not validate a name that is equal to the bot name', () => {
            const control: FormControl = component.gameForm.get('pseudo') as FormControl;
            control.setValue(botName);
            expect(control.status).toEqual('INVALID');
        });

        it('should  validate a name that is not equal to the bot name', () => {
            const control: FormControl = component.gameForm.get('pseudo') as FormControl;
            control.setValue(randomName);
            expect(control.status).toEqual('VALID');
        });
    });

    describe('handleDictionaryDeleted tests', () => {
        it('should call handleRefresh', async () => {
            const spy = spyOn(component, 'handleRefresh').and.resolveTo();
            spyOn(dialog, 'open');
            await component.handleDictionaryDeleted();
            expect(spy).toHaveBeenCalled();
        });
        it('should call showErrorDialog', async () => {
            spyOn(component, 'handleRefresh').and.resolveTo();
            const spy = spyOn(component, 'showErrorDialog' as any);
            spyOn(dialog, 'open');
            await component.handleDictionaryDeleted();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updateDictionaries direct tests', () => {
        it('should call httpService.getAllDictionaries', async () => {
            component.gameForm.controls.dictionary.setValue('boo');
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            await component['updateDictionaries']();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
    });

    describe('handleHttpError tests', () => {
        it('should call showErrorDialog with the http error message ', () => {
            const message = 'watch out !';
            const spy = spyOn(component, 'showErrorDialog' as any);
            spyOn(dialog, 'open');
            spyOn(httpService, 'getErrorMessage').and.returnValue(message);
            component.handleHttpError();
            expect(spy).toHaveBeenCalledWith(message);
        });

        it('should return true on isServerUnreachable if the error is UNREACHABLE_SERVER_MESSAGE', () => {
            spyOn(httpService, 'getErrorMessage').and.returnValue(UNREACHABLE_SERVER_MESSAGE);
            expect(component.isServerUnreachable).toBeTrue();
        });
    });

    it('should chose a random name from the beginner bots array', async () => {
        spyOn(component, 'handleRefresh').and.resolveTo();

        component.bots = [
            { name: 'botA', gameType: 'débutant' },
            { name: 'botB', gameType: 'débutant' },
        ];

        const botNames = ['botA', 'botB'];

        await component.ngAfterViewInit();
        expect(botNames.includes(component.botName)).toBeTrue();
    });

    describe('socketService.on tests', () => {
        const validRoomName = 'Room0';
        const invalidRoomName = '----';

        it('should send createChatChannel event on roomCreated', () => {
            const createChatChannelEventSpy = spyOn(socketServiceMock, 'send');
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, validRoomName);

            expect(createChatChannelEventSpy).toHaveBeenCalledWith(SocketEvent.CreateChatChannel, {
                channel: validRoomName,
                username: {
                    username: playerService.player.pseudo,
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
        });

        it('should not send createChatChannel event on roomCreated if the roomName is invalid', () => {
            const createChatChannelEventSpy = spyOn(socketServiceMock, 'send');
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, invalidRoomName);
            expect(createChatChannelEventSpy).not.toHaveBeenCalled();
        });

        it('should set component attributes correctly on roomCreated', () => {
            component.onProcess = true;
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, validRoomName);
            expect(component.onProcess).toBeFalse();
            expect(component.room.roomInfo.name).toEqual(validRoomName);
        });

        it('should not set component attributes correctly on roomCreated if roomName is invalid', () => {
            component.onProcess = true;
            component.room.roomInfo.name = '';
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, invalidRoomName);
            expect(component.onProcess).toBeFalse();
            expect(component.room.roomInfo.name).toEqual('');
        });

        it('should move the player to game wait page on roomCreated', () => {
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, validRoomName);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/multiplayer/wait']);
        });

        it('should not move the player to game wait page on roomCreated if roomName is invalid', () => {
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, invalidRoomName);
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });
    });

    describe('createRoom tests', () => {
        beforeEach(() => {
            const timerPerTurn = 60;
            component.gameForm.controls.timerPerTurn.setValue(timerPerTurn);
            component.gameForm.controls.dictionary.setValue('french');
            component.gameForm.controls.isPublic.setValue(true);
            component.gameForm.controls.roomPassword.setValue('123');
        });

        it('should send createRoom event with good setting on createRoom', () => {
            component.onProcess = false;
            const createRoomEventSpy = spyOn(socketServiceMock, 'send');
            component.createRoom();
            expect(createRoomEventSpy).toHaveBeenCalledWith(SocketEvent.CreateRoom, component.room);
        });

        it('should set the room correctly on createRoom', () => {
            component.createRoom();
            expect(component.room.currentPlayerPseudo).toEqual(playerService.player.pseudo);
            expect(component.room.roomInfo.creatorName).toEqual(playerService.player.pseudo);
            expect(component.room.roomInfo.timerPerTurn).toEqual(component.gameForm.controls.timerPerTurn.value);
            expect(component.room.roomInfo.dictionary).toEqual(component.gameForm.controls.dictionary.value);
            expect(component.room.roomInfo.isPublic).toEqual(component.gameForm.controls.isPublic.value);
            expect(component.room.roomInfo.password).toEqual(component.gameForm.controls.roomPassword.value);
            expect(component.room.roomInfo.isSolo).toEqual(component.isSolo);
            expect(playerService.player.isCreator).toBeTruthy();
            expect(playerService.player.socketId).toEqual(socketServiceMock.socket.id);
            expect(component.room.players).toEqual([playerService.player]);
        });

        it('should not set a password if the room is private', () => {
            component.gameForm.controls.isPublic.setValue(false);
            component.createRoom();
            expect(component.room.roomInfo.password).toEqual('');
            expect(component.room.roomInfo.isPublic).toEqual(false);
        });

        it('should not send createRoom event if component is on process', () => {
            component.onProcess = true;
            const createRoomEventSpy = spyOn(socketServiceMock, 'send');
            component.createRoom();
            expect(createRoomEventSpy).not.toHaveBeenCalled();
        });
    });
});
