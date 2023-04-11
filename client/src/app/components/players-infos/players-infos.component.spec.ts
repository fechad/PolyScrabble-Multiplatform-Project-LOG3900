/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DEFAULT_ROOM_INFO } from '@app/constants/constants';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { TranslateModule } from '@ngx-translate/core';
import { Socket } from 'socket.io-client';
import { PlayersInfosComponent } from './players-infos.component';

import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {}
describe('PlayersInfosComponent', () => {
    let component: PlayersInfosComponent;
    let fixture: ComponentFixture<PlayersInfosComponent>;

    let socketServiceMock: SocketClientServiceMock;
    let socketServiceBotMock: SocketClientServiceMock;
    let sessionStorageServiceSpy: SessionStorageService;
    let focusHandlerService: FocusHandlerService;

    let routerSpy: SpyObj<Router>;
    let socketHelper: SocketTestHelper;
    let socketHelper2: SocketTestHelper;
    let playerService: PlayerService;
    let player2: Player;
    let httpService: HttpService;
    beforeEach(async () => {
        player2 = new Player();
        player2.pseudo = 'playerPseudo2';
        player2.isItsTurn = true;

        playerService = new PlayerService();
        playerService.player.pseudo = 'playerPseudo';
        playerService.room.roomInfo = DEFAULT_ROOM_INFO;
        playerService.room.currentPlayerPseudo = '';
        playerService.room.players = [playerService.player, player2];

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketHelper2 = new SocketTestHelper();
        socketServiceBotMock = new SocketClientServiceMock();

        socketServiceMock.socket = socketHelper as unknown as Socket;
        socketServiceBotMock.socket = socketHelper2 as unknown as Socket;

        focusHandlerService = new FocusHandlerService();
        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['setItem', 'getPlayerData', 'removeItem']);

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, TranslateModule.forRoot()],
            declarations: [PlayersInfosComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: HttpService },
                { provide: PlayerService, useValue: playerService },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayersInfosComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fixture.detectChanges();
    });
    describe('showEndGame tests', () => {
        it('should open a popup', () => {
            // eslint-disable-next-line dot-notation
            const spy = spyOn(component['dialog'], 'open');
            component.showEndGameDialog();
            expect(spy).toHaveBeenCalled();
        });
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create httpService', () => {
        expect(httpService).toBeTruthy();
    });

    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('get dictionary tests', () => {
        it('should return the dictionary title of the room on get dictionary', () => {
            const expectedResult = 'monDictionnaire';
            playerService.room.roomInfo.dictionary = expectedResult;
            expect(component.dictionary).toEqual(expectedResult);
        });

        it('should return an empty string if the room is undefined', () => {
            component.playerService.room = undefined as unknown as Room;
            expect(component.dictionary).toEqual('');
        });
    });

    describe('Receiving events', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        describe('otherEvents', () => {
            it('should update the currentPlayerTurnPseudo when receiving the event "playerTurnChanged" with a pseudo', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                componentPrivateAccess.currentPlayerTurnPseudo = 'David';
                const pseudo = 'Jacob';
                socketHelper.peerSideEmit('playerTurnChanged', pseudo);
                expect(componentPrivateAccess.currentPlayerTurnPseudo).toEqual(pseudo);
            });

            it('should set the flag isGameOver to true when receiving the event "gameIsOver"', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                componentPrivateAccess.playerService.room.roomInfo.isGameOver = false;
                socketHelper.peerSideEmit('gameIsOver', []);
                expect(componentPrivateAccess.isGameOver).toEqual(true);
            });
            it('no players should be allowed to play when receiving the event "gameIsOver"', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper.peerSideEmit('gameIsOver', []);
                expect(playerService.player.isItsTurn).toEqual(false);
                expect(player2.isItsTurn).toEqual(false);
            });

            it('should call removeItem from sessionStorageService if isSolo on "playerLeft" event', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                playerService.player.isItsTurn = true;
                playerService.room.roomInfo.isSolo = true;
                // eslint-disable-next-line dot-notation -- we need to set private attribute
                componentPrivateAccess['bot'] = { pseudo: playerService.player.pseudo };
                socketHelper.peerSideEmit('playerLeft', playerService.player.pseudo);
                expect(sessionStorageServiceSpy.removeItem).toHaveBeenCalled();
            });

            it('should not update the score of the players when player received does not exist', async () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                spyOn(component, 'getPlayer').and.returnValue(undefined);
                const points = playerService.player.points;
                player2.points = 2;
                socketHelper.peerSideEmit('updatePlayerScore', player2);
                expect(playerService.player.points).toEqual(points);
            });

            it('should not update the score of the players when player received does not exist', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const initialPoints = playerService.player.points;
                const inexistentPlayer = new Player();
                inexistentPlayer.points = 1;
                socketHelper.peerSideEmit('updatePlayerScore', inexistentPlayer);
                expect(playerService.player.points).toEqual(initialPoints);
            });

            it('should update the score of the players ', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const initialPoints = playerService.player.points;
                socketHelper.peerSideEmit('updatePlayerScore', player2);
                expect(playerService.player.points).toEqual(initialPoints);
            });

            it('The winnerPseudo should become the pseudo of the player that won the game', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const winners: Player[] = [player2];
                socketHelper.peerSideEmit('gameIsOver', winners);
                expect(componentPrivateAccess.winnerPseudo).toEqual(player2.pseudo);
            });
        });
    });

    describe('gameIsOver tests', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        it('should set isGameOver to true  on gameIsOver signal', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('gameIsOver');
            expect(componentPrivateAccess.isGameOver).toBeTrue();
        });

        it('should set all the players isItsTurn to false on gameIsOver signal', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            playerService.player.isItsTurn = true;
            player2.isItsTurn = true;
            socketHelper.peerSideEmit('gameIsOver');
            expect(playerService.player.isItsTurn).toBeFalse();
            expect(player2.isItsTurn).toBeFalse();
        });
    });

    describe('getPlayerInfo tests', () => {
        it('should return the correct player pseudo with the good argument', () => {
            component.room.players = [playerService.player, player2];
            expect(component.getPlayerInfo(true, 'pseudo')).toEqual(playerService.player.pseudo);
            expect(component.getPlayerInfo(false, 'pseudo')).toEqual(player2.pseudo);
        });
        it('should return the correct player score with the good argument', () => {
            playerService.player.points = 10;
            player2.points = 5;
            component.room.players = [playerService.player, player2];
            expect(component.getPlayerInfo(true, 'score')).toEqual(playerService.player.points);
            expect(component.getPlayerInfo(false, 'score')).toEqual(player2.points);
        });
    });
});
