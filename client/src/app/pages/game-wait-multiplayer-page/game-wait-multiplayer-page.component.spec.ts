/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HttpService } from '@app/http.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { GameWaitMultiplayerPageComponent } from './game-wait-multiplayer-page.component';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { Router } from '@angular/router';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('GameWaitMultiplayerPageComponent', () => {
    let component: GameWaitMultiplayerPageComponent;
    let fixture: ComponentFixture<GameWaitMultiplayerPageComponent>;

    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    let httpService: HttpService;
    let roomMock: Room;
    let player: Player;
    let player2: Player;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        roomMock = new Room();
        roomMock.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        roomMock.currentPlayerPseudo = '';

        player = new Player();
        player.pseudo = 'playerPseudo';

        player2 = new Player();
        player2.pseudo = 'player2Pseudo';
        roomMock.players = [player];
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [GameWaitMultiplayerPageComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Room, useValue: roomMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: HttpService },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameWaitMultiplayerPageComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('Receiving events', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        describe('Connection tests', () => {
            it('should call the correct socketServiceMock methods on connection', () => {
                socketServiceMock.connect = jasmine.createSpy();
                socketServiceMock.isSocketAlive = jasmine.createSpy();
                componentPrivateAccess.configureBaseSocketFeatures = jasmine.createSpy();
                componentPrivateAccess.connect();
                expect(socketServiceMock.connect).toHaveBeenCalled();
                expect(socketServiceMock.isSocketAlive).toHaveBeenCalled();
                expect(componentPrivateAccess.configureBaseSocketFeatures).toHaveBeenCalled();
            });

            it('should not call socketServiceMock.connect on connection if socket is already connected', () => {
                socketServiceMock.connect = jasmine.createSpy();
                socketServiceMock.socket.connected = true;
                componentPrivateAccess.connect();
                expect(socketServiceMock.connect).not.toHaveBeenCalled();
            });
        });

        describe('receive signals tests', () => {
            let testRoom: Room;
            beforeEach(() => {
                testRoom = new Room();
                testRoom.roomInfo = { name: 'Room0', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
                testRoom.currentPlayerPseudo = '';
            });

            describe('playerFound signal tests', () => {
                it('should set otherPlayerExist to true on playerFound signal', () => {
                    socketHelper.peerSideEmit('playerFound', testRoom);
                    expect(component.otherPlayerExist).toBeTruthy();
                });

                it('should set component.room.players to the players of the playerFound signal room', () => {
                    socketHelper.peerSideEmit('playerFound', testRoom);
                    expect(component.room.players).toEqual(testRoom.players);
                });
            });

            describe('playerLeft signal tests', () => {
                it('should reduce room.players if there is a second player on playerLeft', () => {
                    component.room.players = [player, player2];
                    const nPlayers = component.room.players.length;
                    socketHelper.peerSideEmit('playerLeft');
                    expect(component.room.players.length).toEqual(nPlayers - 1);
                });

                it('should set otherPlayerExist to false on playerLeft', () => {
                    component.otherPlayerExist = true;
                    socketHelper.peerSideEmit('playerLeft');
                    expect(component.otherPlayerExist).toEqual(false);
                });

                it('should call socketServiceMock.send on playerLeft', () => {
                    socketServiceMock.send = jasmine.createSpy();
                    socketHelper.peerSideEmit('playerLeft');
                    expect(socketServiceMock.send).toHaveBeenCalled();
                });
            });
        });
        describe('acceptPlayer', () => {
            it('should not send any socket message when the dictionary no longer exist on the DB', async () => {
                socketServiceMock.send = jasmine.createSpy();
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(false));
                spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
                await component.acceptPlayer();
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });
            it('should open a popup showing the latest http error when an http error happens', async () => {
                socketServiceMock.send = jasmine.createSpy();
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(false));
                spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
                spyOn(httpService, 'getErrorMessage').and.returnValue('Error');
                const dialogSpy = spyOn(component, 'showErrorDialog' as any);
                await component.acceptPlayer();
                expect(dialogSpy).toHaveBeenCalledOnceWith('Error');
            });
            it('should open a popup showing a custom message when the http error is GONE_RESSOURCE_MESSAGE', async () => {
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(false));
                spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
                spyOn(httpService, 'getErrorMessage').and.returnValue(GONE_RESSOURCE_MESSAGE);
                spyOn(component, 'generateDeleteDictionaryMessage' as any).and.returnValue('yes');
                const dialogSpy = spyOn(component, 'showErrorDialog' as any);
                await component.acceptPlayer();
                expect(dialogSpy).toHaveBeenCalledOnceWith('yes');
            });
            it('sould call leaveRoom when the dictionary has been deleted', async () => {
                component.dictionaryExistsOnServer = true;
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(false));
                spyOn(httpService, 'getErrorMessage').and.returnValue(GONE_RESSOURCE_MESSAGE);
                spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
                const spy = spyOn(component, 'leaveRoom');
                await component.acceptPlayer();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(component.dictionaryExistsOnServer).toEqual(false);
            });
            it('sould call not call leaveRoom when an httpErrorOccur, but the dictionary has not been deleted', async () => {
                component.dictionaryExistsOnServer = false;
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(false));
                spyOn(httpService, 'getErrorMessage').and.returnValue('error');
                spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
                const spy = spyOn(component, 'leaveRoom');
                await component.acceptPlayer();
                expect(spy).not.toHaveBeenCalled();
                expect(component.dictionaryExistsOnServer).toEqual(false);
                expect(routerSpy.navigate).not.toHaveBeenCalled();
            });
            it('should call socketService.send on acceptPlayer when the dictionary stills exists and no httpError', async () => {
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(true));
                spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
                socketServiceMock.send = jasmine.createSpy();
                await component.acceptPlayer();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });
            it('should navigate to the game page when the dictionary stills exists and no httpError', async () => {
                spyOn(component, 'dictionarySelectedStillExists' as any).and.returnValue(of(true));
                spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
                await component.acceptPlayer();
                expect(routerSpy.navigate).toHaveBeenCalled();
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
            });
        });
        describe('send signals tests', () => {
            it('should call socketService.send on rejectPlayer', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.rejectPlayer();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });

            it('should call socketService.send on onGotoSolo', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.onGoToSolo();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });
        });

        describe('get pseudo tests', () => {
            it('should return the firstPlayerPseudo on get FirstPlayerPseudo', () => {
                component.room.players = [player, player2];
                expect(component.firstPlayerPseudo).toEqual(component.room.players[0].pseudo);
            });

            it('should return the secondPlayerPseudo on get SecondPlayerPseudo', () => {
                component.room.players = [player, player2];
                expect(component.secondPlayerPseudo).toEqual(component.room.players[1].pseudo);
            });

            it('should return an empty string on get FirstPlayerPseudo if he does not exist', () => {
                component.room.players = [];
                expect(component.firstPlayerPseudo).toEqual('');
            });

            it('should return an empty string on get secondPlayerPseudo if he does not exist', () => {
                component.room.players = [player];
                expect(component.secondPlayerPseudo).toEqual('');
            });
        });

        describe('leaveRoom tests', () => {
            it('should call sock socketService.send on leaveRoom', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.leaveRoom();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });
        });

        describe('get playerPseudos Tests', () => {
            it('should return the player pseudo if the player exist', () => {
                component.room.players = [player, player2];
                expect(component.firstPlayerPseudo).toEqual(player.pseudo);
                expect(component.secondPlayerPseudo).toEqual(player2.pseudo);
            });
            it('should return an empty string if the player does not exist', () => {
                component.room.players = [];
                expect(component.firstPlayerPseudo).toEqual('');
                expect(component.secondPlayerPseudo).toEqual('');
            });
        });
    });
});
