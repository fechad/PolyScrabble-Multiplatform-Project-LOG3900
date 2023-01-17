/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TIMER_TEST_DELAY } from '@app/constants/constants';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs/internal/observable/of';
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
    let room: Room;
    let player: Player;
    let player2: Player;
    let httpService: HttpService;
    let botExpert1: Bot;
    let botBeginner1: Bot;
    beforeEach(async () => {
        room = new Room();
        room.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        room.currentPlayerPseudo = '';

        player = new Player();
        player2 = new Player();
        player.pseudo = 'playerPseudo';
        player2.pseudo = 'playerPseudo2';
        player2.isItsTurn = true;
        room.players = [player, player2];

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
            imports: [HttpClientModule],
            declarations: [PlayersInfosComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: SocketClientBotService, useValue: socketServiceBotMock },
                { provide: Router, useValue: routerSpy },
                { provide: Room, useValue: room },
                { provide: Player, useValue: player },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: HttpService },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayersInfosComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        botExpert1 = { name: 'BOT A', gameType: 'expert' };
        botBeginner1 = { name: 'BOT B', gameType: 'débutant' };
        component.bots = [botExpert1, botBeginner1];
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

    describe('get tests', () => {
        it('should return  expert bots', () => {
            const result = component.experts;
            expect(component.bots[0]).toEqual(result[0]);
        });
        it('should return  debutant bots', () => {
            const result = component.beginners;
            expect(component.bots[1]).toEqual(result[0]);
        });
    });
    describe('get dictionary tests', () => {
        it('should return the dictionary title of the room on get dictionary', () => {
            const expectedResult = 'monDictionnaire';
            room.roomInfo.dictionary = expectedResult;
            expect(component.dictionary).toEqual(expectedResult);
        });

        it('should return an empty string if the room is undefined', () => {
            component.room = undefined as unknown as Room;
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

        describe('connect() tests', () => {
            it('should call configureBaseSocketFeatures when both socket are alive', () => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
                spyOn(socketServiceBotMock, 'isSocketAlive').and.returnValue(true);
                const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
                componentPrivateAccess.connect();
                expect(spy).toHaveBeenCalled();
            });

            it('should try to reconnect if one of the socket is not alive', () => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
                const spy = spyOn(componentPrivateAccess, 'tryReconnection');
                componentPrivateAccess.connect();
                expect(spy).toHaveBeenCalled();
            });

            it('should reconnect if the socket is alive', (done) => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
                spyOn(socketServiceBotMock, 'isSocketAlive').and.returnValue(true);
                const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
                componentPrivateAccess.tryReconnection();

                setTimeout(() => {
                    expect(spy).toHaveBeenCalled();
                    done();
                }, TIMER_TEST_DELAY);
            });
            it('should not reconnect if the socket is not alive after 5 sec', (done) => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
                const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
                componentPrivateAccess.tryReconnection();

                setTimeout(() => {
                    expect(spy).not.toHaveBeenCalled();
                    done();
                }, TIMER_TEST_DELAY);
            });
        });
        describe('otherEvents', () => {
            it('should update the currentPlayerTurnPseudo when receiving the event "playerTurnChanged" with a pseudo', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                componentPrivateAccess.currentPlayerTurnPseudo = 'David';
                const pseudo = 'Jacob';
                socketHelper.peerSideEmit('playerTurnChanged', pseudo);
                expect(componentPrivateAccess.currentPlayerTurnPseudo).toEqual(pseudo);
            });

            it('should update the focus to chat on "playerTurnChanged" event when it is the playerTurn', () => {
                focusHandlerService.currentFocus.next(CurrentFocus.NONE);
                componentPrivateAccess.configureBaseSocketFeatures();
                player.isItsTurn = true;
                const pseudo = 'Jacob';
                socketHelper.peerSideEmit('playerTurnChanged', pseudo);
                expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
            });

            it('should send botPlayAction if isSolo on "playerTurnChanged" event when it is the playerTurn', () => {
                const spy = spyOn(socketServiceBotMock, 'send').and.callThrough();
                componentPrivateAccess.configureBaseSocketFeatures();
                player.isItsTurn = true;
                room.roomInfo.isSolo = true;
                // eslint-disable-next-line dot-notation -- we need to set private attribute
                componentPrivateAccess['bot'] = { pseudo: player.pseudo };
                socketHelper.peerSideEmit('playerTurnChanged', player.pseudo);
                expect(spy).toHaveBeenCalled();
            });

            it('should set the flag isGameOver to true when receiving the event "gameIsOver"', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                componentPrivateAccess.room.roomInfo.isGameOver = false;
                socketHelper.peerSideEmit('gameIsOver', []);
                expect(componentPrivateAccess.isGameOver).toEqual(true);
            });
            it('no players should be allowed to play when receiving the event "gameIsOver"', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper.peerSideEmit('gameIsOver', []);
                expect(player.isItsTurn).toEqual(false);
                expect(player2.isItsTurn).toEqual(false);
            });
            it('should send convertToRoomSoloBot if isSolo on "playerLeft" event', () => {
                const spy = spyOn(socketServiceBotMock, 'send').and.callThrough();
                componentPrivateAccess.configureBaseSocketFeatures();
                player.isItsTurn = true;
                room.roomInfo.isSolo = true;
                // eslint-disable-next-line dot-notation -- we need to set private attribute
                componentPrivateAccess['bot'] = { pseudo: player.pseudo };
                socketHelper.peerSideEmit('playerLeft', player.pseudo);
                expect(spy).toHaveBeenCalled();
            });
            it('should call removeItem from sessionStorageService if isSolo on "playerLeft" event', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                player.isItsTurn = true;
                room.roomInfo.isSolo = true;
                // eslint-disable-next-line dot-notation -- we need to set private attribute
                componentPrivateAccess['bot'] = { pseudo: player.pseudo };
                socketHelper.peerSideEmit('playerLeft', player.pseudo);
                expect(sessionStorageServiceSpy.removeItem).toHaveBeenCalled();
            });
            it('should check if timeUpdated was called', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const timeBefore = Math.max(+componentPrivateAccess.room.roomInfo.timerPerTurn - componentPrivateAccess.room.elapsedTime, 0);
                socketHelper.peerSideEmit('timeUpdated', componentPrivateAccess.room);
                expect(timeBefore).toEqual(componentPrivateAccess.remainingTime);
            });

            it('should not update the score of the players when player received does not exist', async () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                spyOn(component, 'getPlayer').and.returnValue(undefined);
                const points = player.points;
                player2.points = 2;
                socketHelper.peerSideEmit('updatePlayerScore', player2);
                expect(player.points).toEqual(points);
            });
            it('should set isSolo to true when player received does not exist', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper.peerSideEmit('convertToRoomSoloBotStatus');
                expect(component.room.roomInfo.isSolo).toEqual(true);
            });

            it('should not update the score of the players when player received does not exist', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const initialPoints = componentPrivateAccess.player.points;
                const inexistentPlayer = new Player();
                inexistentPlayer.points = 1;
                socketHelper.peerSideEmit('updatePlayerScore', inexistentPlayer);
                expect(componentPrivateAccess.player.points).toEqual(initialPoints);
            });

            it('should update the score of the players ', () => {
                componentPrivateAccess.configureBaseSocketFeatures();
                const initialPoints = componentPrivateAccess.player.points;
                socketHelper.peerSideEmit('updatePlayerScore', player2);
                expect(componentPrivateAccess.player.points).toEqual(initialPoints);
            });

            it('should swap the leaving player to a bot when receiving the event "botInfos"', () => {
                player.isItsTurn = true;
                player2.isItsTurn = true;
                const randomPlayer = new Player();
                randomPlayer.pseudo = 'pseudo';
                componentPrivateAccess.room.players = [player, randomPlayer];
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper.peerSideEmit('botInfos', player2);
                expect(componentPrivateAccess.bot).toEqual(player2);
                expect(componentPrivateAccess.room.players.includes(player2)).toEqual(true);
            });

            it('should add the bot to the room on botInfos if the room length === 1', () => {
                componentPrivateAccess.room.players = [player];
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper.peerSideEmit('botInfos', player2);
                expect(componentPrivateAccess.bot).toEqual(player2);
                expect(componentPrivateAccess.room.players.includes(player2)).toEqual(true);
            });

            it('when receiving the event "botPlayedAction"', () => {
                const spy = spyOn(socketServiceBotMock, 'send').and.callThrough();
                componentPrivateAccess.configureBaseSocketFeatures();
                socketHelper2.peerSideEmit('botPlayedAction', 'message');
                expect(spy).toHaveBeenCalled();
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
            player.isItsTurn = true;
            player2.isItsTurn = true;
            socketHelper.peerSideEmit('gameIsOver');
            expect(player.isItsTurn).toBeFalse();
            expect(player2.isItsTurn).toBeFalse();
        });
    });

    describe('getPlayerInfo tests', () => {
        it('should return the correct player pseudo with the good argument', () => {
            component.room.players = [player, player2];
            expect(component.getPlayerInfo(true, 'pseudo')).toEqual(player.pseudo);
            expect(component.getPlayerInfo(false, 'pseudo')).toEqual(player2.pseudo);
        });
        it('should return the correct player score with the good argument', () => {
            player.points = 10;
            player2.points = 5;
            component.room.players = [player, player2];
            expect(component.getPlayerInfo(true, 'score')).toEqual(player.points);
            expect(component.getPlayerInfo(false, 'score')).toEqual(player2.points);
        });
    });
    describe('handleRefresh() tests', () => {
        it('should call getAllBots', async () => {
            const spy = spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should clear the bots when an error has occurred', async () => {
            component.bots = [botExpert1];
            spyOn(httpService, 'getAllBots').and.returnValue(of());
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleRefresh();
            expect(component.bots).toEqual([]);
        });
    });
});
