/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { SocketEvent } from '@app/enums/socket-event';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
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
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreateMultiplayerPageComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    describe('socketService.on tests', () => {
        const roomValidName = new Room();
        roomValidName.roomInfo.name = 'Room0';
        const roomInvalidName = new Room();
        roomInvalidName.roomInfo.name = '----';

        it('should send createChatChannel event on roomCreated', () => {
            const createChatChannelEventSpy = spyOn(socketServiceMock, 'send');
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomValidName);

            expect(createChatChannelEventSpy).toHaveBeenCalledWith(SocketEvent.CreateChatChannel, {
                channel: roomValidName.roomInfo.name,
                username: playerService.reducePLayerInfo(),
                isRoomChannel: true,
            });
        });

        it('should not send createChatChannel event on roomCreated if the roomName is invalid', () => {
            const createChatChannelEventSpy = spyOn(socketServiceMock, 'send');
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomInvalidName);
            expect(createChatChannelEventSpy).not.toHaveBeenCalled();
        });

        it('should set component attributes correctly on roomCreated', () => {
            component.onProcess = true;
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomValidName);
            expect(component.onProcess).toBeFalse();
            expect(component.room.roomInfo.name).toEqual(roomValidName.roomInfo.name);
        });

        it('should not set component attributes correctly on roomCreated if roomName is invalid', () => {
            component.onProcess = true;
            component.room.roomInfo.name = '';
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomInvalidName);
            expect(component.onProcess).toBeFalse();
            expect(component.room.roomInfo.name).toEqual('');
        });

        it('should move the player to game wait page on roomCreated if multi', () => {
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomValidName);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/multiplayer/wait']);
        });

        it('should move the player to game page on roomCreated if solo', () => {
            component.room.roomInfo.isSolo = true;
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomValidName);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
        });

        it('should set the client room player to the server room player on solo', () => {
            component.room.roomInfo.isSolo = true;
            roomInvalidName.players = [new Player()];
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomValidName);
            expect(component.room.players).toEqual(roomValidName.players);
        });

        it('should not move the player to game wait page on roomCreated if roomName is invalid', () => {
            socketHelper.peerSideEmit(SocketEvent.RoomCreated, roomInvalidName);
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

        it('should send createRoom event with good setting on createRoom if multi', () => {
            component.onProcess = false;
            const createRoomEventSpy = spyOn(socketServiceMock, 'send');
            component.createRoom();
            expect(createRoomEventSpy).toHaveBeenCalledWith(SocketEvent.CreateRoom, component.room);
        });

        it('should send createRoom event with good setting on createRoom if solo', () => {
            component.onProcess = false;
            component.room.roomInfo.isSolo = true;
            const createRoomEventSpy = spyOn(socketServiceMock, 'send');
            component.createRoom();
            expect(createRoomEventSpy).toHaveBeenCalledWith(SocketEvent.CreateSoloRoom, {
                room: component.room,
                botName: component.gameForm.controls.botName.value,
                desiredLevel: component.gameForm.controls.level.value,
            });
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
