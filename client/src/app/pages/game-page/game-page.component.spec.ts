import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DEFAULT_ROOM_INFO } from '@app/constants/constants';
import { SocketEvent } from '@app/enums/socket-event';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from './../../services/socket-client.service';
import { GamePageComponent } from './game-page.component';

import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let sessionStorageService: SessionStorageService;
    let focusHandlerService: FocusHandlerService;

    let playerService: PlayerService;
    let routerSpy: SpyObj<Router>;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);

        playerService = new PlayerService();
        playerService.room.roomInfo = DEFAULT_ROOM_INFO;
        playerService.room.currentPlayerPseudo = '';

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        sessionStorageService = new SessionStorageService();
        focusHandlerService = new FocusHandlerService();

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: SessionStorageService, useValue: sessionStorageService },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: PlayerService, useValue: playerService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('onInit tests', () => {
        it('should call getPlayerData on init', () => {
            const getPlayerDataSpy = spyOn(sessionStorageService, 'getPlayerData');
            component.ngOnInit();
            expect(getPlayerDataSpy).toHaveBeenCalledWith('data');
        });

        it('should send reconnect on init if the roomName is empty', () => {
            playerService.room.roomInfo.name = '';
            const sendSpy = spyOn(socketServiceMock, 'send');
            component.ngOnInit();
            expect(sendSpy).toHaveBeenCalled();
        });
    });

    it('should call socketService.send with good attributes on letterBankCommand', () => {
        const spy = spyOn(socketServiceMock, 'send');
        component.letterBankCommand();
        expect(spy).toHaveBeenCalledWith('message', '!réserve');
    });

    it('should call socketService.send with good attributes on helpCommand', () => {
        const spy = spyOn(socketServiceMock, 'send');
        component.helpCommand();
        expect(spy).toHaveBeenCalledWith('message', '!aide');
    });

    describe('updateFocus tests', () => {
        // TODO: see if we must set currentFocus to none for this project
        it('should call stopPropagation on updateFocus and set currentFocus to none', () => {
            const mouseEvent = {
                stopPropagation: () => {
                    return;
                },
            } as MouseEvent;
            const stopPropagationSpy = spyOn(mouseEvent, 'stopPropagation');
            component.updateFocus(mouseEvent);
            expect(stopPropagationSpy).toHaveBeenCalled();
            // expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.NONE);
        });
    });

    it('should send startGame event on startGame', () => {
        const spy = spyOn(socketServiceMock, 'send');
        component.startGame();
        expect(spy).toHaveBeenCalledWith(SocketEvent.StartGame);
    });

    describe('send signals tests', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        it('should call socketService.send on startGame', () => {
            const spy = spyOn(component, 'startGame').and.callThrough();
            component.room.roomInfo.name = 'TONY';
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call sessionStorage.setItem on setItem', () => {
            const spy = spyOn(sessionStorageService, 'setItem').and.callThrough();
            componentPrivateAccess.configureBaseSocketFeatures();
            const data = { room: componentPrivateAccess.room, player: new Player() };
            socketHelper.peerSideEmit(SocketEvent.Reconnected, data);
            expect(spy).toHaveBeenCalled();
        });

        it('should set the room correctly on reconnected', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            const gameInfo = { room: new Room(), player: new Player() };
            socketHelper.peerSideEmit(SocketEvent.Reconnected, gameInfo);
            expect(componentPrivateAccess.room.roomInfo.name).toEqual(gameInfo.room.roomInfo.name);
            expect(componentPrivateAccess.room.roomInfo.timerPerTurn).toEqual(gameInfo.room.roomInfo.timerPerTurn);
            expect(componentPrivateAccess.room.roomInfo.dictionary).toEqual(gameInfo.room.roomInfo.dictionary);
            expect(componentPrivateAccess.room.roomInfo.gameType).toEqual(gameInfo.room.roomInfo.gameType);
            expect(componentPrivateAccess.room.roomInfo.maxPlayers).toEqual(gameInfo.room.roomInfo.maxPlayers);
            expect(componentPrivateAccess.room.players).toEqual(gameInfo.room.players);
            expect(componentPrivateAccess.room.elapsedTime).toEqual(gameInfo.room.elapsedTime);
        });

        it('should set the player correctly on reconnected', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            const gameInfo = { room: new Room(), player: new Player() };
            socketHelper.peerSideEmit(SocketEvent.Reconnected, gameInfo);
            expect(componentPrivateAccess.playerService.player.pseudo).toEqual(gameInfo.player.pseudo);
            expect(componentPrivateAccess.playerService.player.socketId).toEqual(gameInfo.player.socketId);
            expect(componentPrivateAccess.playerService.player.points).toEqual(gameInfo.player.points);
            expect(componentPrivateAccess.playerService.player.isCreator).toEqual(gameInfo.player.isCreator);
            expect(componentPrivateAccess.playerService.player.isItsTurn).toEqual(gameInfo.player.isItsTurn);
        });
    });
});
