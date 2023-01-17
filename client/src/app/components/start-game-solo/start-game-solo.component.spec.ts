/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable max-classes-per-file */ // we create multiple class to mock and remove dependence
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameData } from '@app/classes/game-data';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HttpService } from '@app/http.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { StartGameSoloComponent } from './start-game-solo.component';
import SpyObj = jasmine.SpyObj;

export class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}
export class SocketClientBotServiceMock extends SocketClientBotService {
    override connect() {
        return;
    }
}
describe('StartGameSoloComponent', () => {
    let component: StartGameSoloComponent;
    let fixture: ComponentFixture<StartGameSoloComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketServiceBotMock: SocketClientBotServiceMock;

    let socketHelper: SocketTestHelper;
    let player: Player;
    let bot: Player;
    let room: Room;
    let routerSpy: SpyObj<Router>;
    let pseudo: string;
    let timerPerTurn: string;
    let dictionary: string;
    let gameDataStub: GameData;

    beforeEach(async () => {
        room = new Room();
        timerPerTurn = '60';
        dictionary = 'French';
        gameDataStub = new GameData();
        room.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        socketServiceBotMock = new SocketClientBotServiceMock();
        socketServiceBotMock.socket = socketHelper as unknown as Socket;
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        player = new Player();
        await TestBed.configureTestingModule({
            declarations: [StartGameSoloComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: SocketClientBotService, useValue: socketServiceBotMock },
                { provide: Router, useValue: routerSpy },
                { provide: Room, useValue: room },
                { provide: Player, useValue: player },
                { provide: HttpService },
            ],
            imports: [RouterTestingModule, HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StartGameSoloComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('connect() tests', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        it('should call configureBaseSocketFeatures when if socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });
        it('should call configureBaseSocketFeatures when if socketBot is alive', () => {
            spyOn(socketServiceBotMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });
        it('should try to disconnect if the socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(socketHelper, 'disconnect');
            socketServiceMock.disconnect();
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });
        it('should try to disconnect if the socket is alive', () => {
            spyOn(socketServiceBotMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(socketHelper, 'disconnect');
            socketServiceBotMock.disconnect();
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });
        it('should call configureBaseSocketFeatures when if socket is alive', () => {
            spyOn(socketServiceBotMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('otherEvents', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        it('should make an update with the new room name ', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            componentPrivateAccess.room.roomInfo.name = 'RoomOld';
            const serverRoomName = 'RoomNew';
            socketHelper.peerSideEmit('joinRoomSoloStatus', serverRoomName);
            expect(componentPrivateAccess.room.roomInfo.name).toEqual(serverRoomName);
        });
        it('should get out when it did not get the right server room name ', () => {
            componentPrivateAccess.connect();
            const serverRoomName = 'wrongRoom';
            socketHelper.peerSideEmit('joinRoomSoloStatus', serverRoomName);
        });
        it('should add the Bot Player into a game room ', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('botInfos', bot);
            expect(componentPrivateAccess.room.players[1]).toBe(bot);
        });

        describe('function setRoomInfo tests ', () => {
            it('the form should be valid when created', () => {
                component.gameData = gameDataStub;
                expect(component.gameData).toBeTruthy();
            });
            it('should test if setRoomInfo function has been called', () => {
                component.gameData = gameDataStub;
                const spy = spyOn(component, 'setRoomInfo');
                component.setRoomInfo(pseudo);
                expect(spy).toHaveBeenCalled();
            });
            it('should update the room with the new information ', () => {
                component.gameData = gameDataStub;
                component.setRoomInfo(pseudo);
                component.room.roomInfo.timerPerTurn = timerPerTurn;
                component.room.roomInfo.dictionary = dictionary;
                component.room.roomInfo.isSolo = true;
                expect(room.roomInfo.timerPerTurn).toBe(timerPerTurn);
                expect(room.roomInfo.dictionary).toBe(dictionary);
                expect(room.roomInfo.isSolo).toBeTruthy();
            });
        });
        describe('function setPlayerInfo tests ', () => {
            it('the form should be valid when created', () => {
                component.gameData = gameDataStub;
                expect(component.gameData).toBeTruthy();
            });
            it('should test if setPlayerInfo function has been called', () => {
                component.gameData = gameDataStub;
                const spy = spyOn(component, 'setPlayerInfo');
                component.setPlayerInfo(pseudo);
                expect(spy).toHaveBeenCalled();
            });
        });
        describe('function joinRoom tests ', () => {
            it('should test if joinRoom function has been called', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                component.gameData = gameDataStub;
                const spy = spyOn(component, 'joinRoom');
                await component.joinRoom();
                expect(spy).toHaveBeenCalled();
            });

            it('should not call socketServiceMock.send on joinRoom if there is no gameData', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                socketServiceMock.send = jasmine.createSpy();
                component.gameData = undefined;
                await component.joinRoom();
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });

            it('should not call socketServiceMock.send on joinRoom if there is an invalid gameType', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                component.gameData = gameDataStub;
                socketServiceMock.send = jasmine.createSpy();
                component.room.roomInfo.gameType = 'invalidType';
                await component.joinRoom();
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });
        });
    });
    describe('gameData tests', () => {
        it('should set the pseudo of its room to the pseudo value of the form on joinRoom', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            component.gameData = gameDataStub;
            const formPseudo = gameDataStub.pseudo;
            await component.joinRoom();
            expect(component.room.players[0].pseudo).toEqual(formPseudo);
        });

        it('should set the timerPerTurn of its room to the timerPerTurn value of the form on joinRoom', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            component.gameData = gameDataStub;
            const formTimerPerTurn = gameDataStub.timerPerTurn;
            await component.joinRoom();
            expect(component.room.roomInfo.timerPerTurn).toEqual(formTimerPerTurn);
        });
    });

    describe('hasValidGameType tests', () => {
        it('should return true if the room gameType is classic', () => {
            component.room.roomInfo.gameType = 'classic';
            expect(component.hasValidGameType).toBeTruthy();
        });
        it('should return true if the room gameType is log2990', () => {
            component.room.roomInfo.gameType = 'log2990';
            expect(component.hasValidGameType).toBeTruthy();
        });
        it('should return false if the room gameType is not classic or log2990', () => {
            component.room.roomInfo.gameType = 'invalid';
            expect(component.hasValidGameType).toBeFalsy();
        });
    });

    describe('isFormValid tests', () => {
        it('should return false if the form does not exist', () => {
            expect(component.isFormValid).toBeFalsy();
        });

        it('should return true if the form is valid', () => {
            spyOn(component, 'isDictionarySelected' as any).and.returnValue(true);
            const gameFormStub = {
                valid: true,
            } as unknown as FormGroup;
            component.gameForm = gameFormStub;
            expect(component.isFormValid).toBeTruthy();
        });

        it('should return false if the form is valid', () => {
            const gameFormStub = {
                valid: false,
            } as unknown as FormGroup;
            component.gameForm = gameFormStub;
            expect(component.isFormValid).toBeFalsy();
        });
    });
});
