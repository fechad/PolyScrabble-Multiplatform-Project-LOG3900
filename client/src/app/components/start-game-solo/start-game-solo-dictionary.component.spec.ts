/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable max-classes-per-file */ // we create multiple class to mock and remove dependence
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameData } from '@app/classes/game-data';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { HttpService } from '@app/http.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { StartGameSoloComponent } from './start-game-solo.component';
import { SocketClientBotServiceMock, SocketClientServiceMock } from './start-game-solo.component.spec';
import SpyObj = jasmine.SpyObj;

describe('StartGameSoloComponent (dictionary) tests', () => {
    let component: StartGameSoloComponent;
    let fixture: ComponentFixture<StartGameSoloComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketServiceBotMock: SocketClientBotServiceMock;
    let validGameData: GameData;
    let socketHelper: SocketTestHelper;
    let player: Player;
    let room: Room;
    let routerSpy: SpyObj<Router>;
    let httpService: HttpService;

    beforeEach(async () => {
        room = new Room();
        room.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        socketServiceBotMock = new SocketClientBotServiceMock();
        socketServiceBotMock.socket = socketHelper as unknown as Socket;
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        player = new Player();
        validGameData = new GameData();
        validGameData.dictionary = 'french';
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
        httpService = fixture.debugElement.injector.get(HttpService);
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('isFormValid tests', () => {
        it('should return false when no dictionary is selected', () => {
            spyOn(component, 'isDictionarySelected' as any).and.returnValue(false);
            expect(component.isFormValid).toBeFalse();
        });
    });
    describe('isDictionarySelectedTests', () => {
        it('should return false when the value of the dictionary is ""', () => {
            component.gameData = validGameData;
            component.gameData.dictionary = '';
            const result = component['isDictionarySelected']();
            expect(result).toBeFalse();
        });
        it('should return false when the value of the dictionary is not ""', () => {
            component.gameData = validGameData;
            component.gameData.dictionary = 'hello';
            const result = component['isDictionarySelected']();
            expect(result).toBeTrue();
        });
        it('should return false when the gameForm is undefined', () => {
            component.gameData = undefined;
            expect(component['isDictionarySelected']()).toBeFalse();
        });
    });
    describe('dictionaryExists direct tests', () => {
        it('should return false when the game form is undefined', () => {
            component.gameData = undefined;
            expect(component['dictionaryExists']()).toBeFalse();
        });
        it('should return false when the dictionary is ""', () => {
            component.gameData = validGameData;
            component.gameData.dictionary = '';
            expect(component['dictionaryExists']()).toBeFalse();
        });
        it('should return true when the dictionary is not ""', () => {
            component.gameData = validGameData;
            component.gameData.dictionary = 'snoop';
            expect(component['dictionaryExists']()).toBeTrue();
        });
    });
    describe('dictionarySelectedExists direct tests', () => {
        it('should call getDictionary from the httpService', async () => {
            const spy = spyOn(httpService, 'getDictionary' as any).and.returnValue(of({ title: 'a', description: 'y' } as Dictionary));
            await component['dictionarySelectedExists']('italian');
            expect(spy).toHaveBeenCalledWith('italian', false);
        });
        it('should return false when the server does not return a dictionary', async () => {
            spyOn(httpService, 'getDictionary' as any).and.returnValue(of({}));
            const result = await component['dictionarySelectedExists']('italian');
            expect(result).toBeFalse();
        });
        it('should return true when the server does not returns a dictionary with the correct title', async () => {
            spyOn(httpService, 'getDictionary' as any).and.returnValue(of({ title: 'a', description: 'y' } as Dictionary));
            const result = await component['dictionarySelectedExists']('a');
            expect(result).toBeTrue();
        });
    });
    describe('Prevent game from starting when dictionary does not exist anymore tests', () => {
        it('should call getDictionary without getting the words from the dictionary', async () => {
            const dictionary: Dictionary = { title: 'hip hop slangs', description: '...' };
            const spy = spyOn(httpService, 'getDictionary').and.returnValue(of(dictionary));
            await component['dictionarySelectedExists']('hip hop slangs');
            expect(spy).toHaveBeenCalledOnceWith('hip hop slangs', false);
        });
        it('should return false when the server does not have  dictionary', async () => {
            const dictionary: Dictionary = { title: 'hip hop slangs', description: '...' };
            spyOn(httpService, 'getDictionary').and.returnValue(of(dictionary));
            const result = await component['dictionarySelectedExists']('foo');
            expect(result).toBeFalse();
        });
        it('should return true when the server has  dictionary', async () => {
            const dictionary: Dictionary = { title: 'hip hop slangs', description: '...' };
            spyOn(httpService, 'getDictionary').and.returnValue(of(dictionary));
            const result = await component['dictionarySelectedExists']('hip hop slangs');
            expect(result).toBeTrue();
        });
    });
    describe('joinRoom', () => {
        it('should NOT call socketServiceMock.send on joinRoom when the dictionary does not exist on the server', async () => {
            component.gameData = validGameData;
            spyOn(httpService, 'anErrorOccurred' as any).and.returnValue(true);
            const spy = spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(false));
            socketServiceMock.send = jasmine.createSpy();
            await component.joinRoom();
            expect(spy).toHaveBeenCalled();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should call socketServiceMock.send on joinRoom when the dictionary does not exist on the server', async () => {
            component.gameData = validGameData;
            const spy = spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            await component.joinRoom();
            expect(spy).toHaveBeenCalled();
            expect(socketServiceMock.send).toHaveBeenCalled();
        });
        it('should only emit the a httpError signal when an HTTP error happens', async () => {
            component.gameData = validGameData;
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(false));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            spyOn(httpService, 'getErrorMessage').and.returnValue('Random error');
            const dictioanryDeletedSpy = spyOn(component['dictionaryDeleted'], 'emit');
            const httpErrorSpy = spyOn(component['httpError'], 'emit');
            await component.joinRoom();
            expect(dictioanryDeletedSpy).not.toHaveBeenCalled();
            expect(httpErrorSpy).toHaveBeenCalled();
        });
        it('should only emit the dictionaryDelete signal when the dictionary selected is no longer on the server', async () => {
            component.gameData = validGameData;
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(false));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            spyOn(httpService, 'getErrorMessage').and.returnValue(GONE_RESSOURCE_MESSAGE);
            const dictioanryDeletedSpy = spyOn(component['dictionaryDeleted'], 'emit');
            const httpErrorSpy = spyOn(component['httpError'], 'emit');
            await component.joinRoom();
            expect(dictioanryDeletedSpy).toHaveBeenCalled();
            expect(httpErrorSpy).not.toHaveBeenCalled();
        });
        it('should not emit a socket signal when the dictionary selected has an empty title', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            component.gameData = validGameData;
            component.gameData.dictionary = '';
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should not emit a socket signal when the gameForm is undefnied', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            component.gameData = undefined;
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
    });
});
