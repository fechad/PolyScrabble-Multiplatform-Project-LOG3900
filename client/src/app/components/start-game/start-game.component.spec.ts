/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { HttpService } from '@app/http.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { StartGameComponent } from './start-game.component';
import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('StartGameComponent', () => {
    let component: StartGameComponent;
    let fixture: ComponentFixture<StartGameComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let routerSpy: SpyObj<Router>;
    let socketHelper: SocketTestHelper;
    let gameFormStub: FormGroup;
    let formBuilder: FormBuilder;
    let roomMock: Room;
    let roomServiceMock: Room;
    let httpService: HttpService;
    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        formBuilder = new FormBuilder();
        gameFormStub = formBuilder.group({
            pseudo: '',
            timerPerTurn: '',
            dictionary: '---',
        });
        roomMock = new Room();
        roomMock.roomInfo = { name: '', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        roomMock.currentPlayerPseudo = '';

        roomServiceMock = new Room();
        roomServiceMock.roomInfo = { name: '', timerPerTurn: '60', dictionary: 'french', gameType: 'log2990', maxPlayers: 2 };
        roomServiceMock.currentPlayerPseudo = '';

        await TestBed.configureTestingModule({
            declarations: [StartGameComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Router, useValue: routerSpy },
                { provide: Room, useValue: roomServiceMock },
                { provide: HttpService },
            ],
            imports: [RouterTestingModule, HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StartGameComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fixture.detectChanges();

        component.gameForm = gameFormStub;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });
    describe('Receiving events', () => {
        describe('Connection tests', () => {
            let componentPrivateAccess: any;
            beforeEach(() => {
                componentPrivateAccess = component;
            });
            it('should call socketServiceMock.connect on connection', () => {
                socketServiceMock.connect = jasmine.createSpy();
                componentPrivateAccess.connect();
                expect(socketServiceMock.connect).toHaveBeenCalled();
            });
            it('should call socketServiceMock.disconnect if socket is already connected', () => {
                socketServiceMock.disconnect = jasmine.createSpy();
                socketServiceMock.socket.connected = true;
                componentPrivateAccess.connect();
                expect(socketServiceMock.disconnect).toHaveBeenCalled();
            });
            it('should call socketServiceMock.isSocketAlive on connect', () => {
                socketServiceMock.isSocketAlive = jasmine.createSpy();
                componentPrivateAccess.connect();
                expect(socketServiceMock.isSocketAlive).toHaveBeenCalled();
            });
            it('should call configureBaseSocketFeatures on connection', () => {
                componentPrivateAccess.configureBaseSocketFeatures = jasmine.createSpy();
                componentPrivateAccess.connect();
                expect(componentPrivateAccess.configureBaseSocketFeatures).toHaveBeenCalled();
            });
        });
        describe('joinRoomStatus tests', () => {
            it('should not call router.navigate if the room has no name', () => {
                socketHelper.peerSideEmit('joinRoomStatus', roomMock.roomInfo.name);
                expect(routerSpy.navigate).not.toHaveBeenCalled();
            });
            it('should call router.navigate if it successfully joined a room', () => {
                roomMock.roomInfo.name = 'Room0';
                socketHelper.peerSideEmit('joinRoomStatus', roomMock.roomInfo.name);
                expect(routerSpy.navigate).toHaveBeenCalled();
            });
            it('should set this.room.roomInfo.name to serverRoom.name if it successfully joined a room', () => {
                roomMock.roomInfo.name = 'Room0';
                socketHelper.peerSideEmit('joinRoomStatus', roomMock.roomInfo.name);
                expect(component.room.roomInfo.name).toEqual(roomMock.roomInfo.name);
            });
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
            component.gameForm = undefined;
            expect(component.isFormValid).toBeFalsy();
        });
        it('should return true if the form is valid', () => {
            spyOn(component, 'isDictionarySelected' as any).and.returnValue(true);
            const gameFormStub2 = {
                valid: true,
            } as unknown as FormGroup;
            component.gameForm = gameFormStub2;
            expect(component.isFormValid).toBeTruthy();
        });
        it('should return false if the form is valid', () => {
            const gameFormStub2 = {
                valid: false,
            } as unknown as FormGroup;
            component.gameForm = gameFormStub2;
            expect(component.isFormValid).toBeFalsy();
        });
    });
    describe('joinRoom tests', () => {
        it('should call socketServiceMock.send on joinRoom if there is a gameForm and a log2990 gameType', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            await component.joinRoom();
            expect(socketServiceMock.send).toHaveBeenCalled();
        });
        it('should not call socketServiceMock.send on joinRoom if there is no gameForm', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            component.gameForm = undefined;
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should not call socketServiceMock.send on joinRoom if there is an invalid gameType', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            component.room.roomInfo.gameType = 'invalidType';
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should NOT call socketServiceMock.send on joinRoom when the dictionary does not exist on the server', async () => {
            spyOn(httpService, 'anErrorOccurred' as any).and.returnValue(true);
            const spy = spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(false));
            socketServiceMock.send = jasmine.createSpy();
            await component.joinRoom();
            expect(spy).toHaveBeenCalled();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should call socketServiceMock.send on joinRoom when the dictionary does not exist on the server', async () => {
            const spy = spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            await component.joinRoom();
            expect(spy).toHaveBeenCalled();
            expect(socketServiceMock.send).toHaveBeenCalled();
        });
        it('should only emit the a httpError signal when an HTTP error happens', async () => {
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
            component.gameForm?.controls.dictionary.setValue('');
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
        });
        it('should not emit a socket signal when the gameForm is undefnied', async () => {
            spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
            socketServiceMock.send = jasmine.createSpy();
            component.gameForm = undefined;
            await component.joinRoom();
            expect(socketServiceMock.send).not.toHaveBeenCalled();
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
        describe('validateGameType tests', () => {
            it('should return true when the game type is log2990', () => {
                component.room.roomInfo.gameType = 'log2990';
                expect(component.hasValidGameType).toBeTrue();
            });
            it('should return true when the game type is classic', () => {
                component.room.roomInfo.gameType = 'classic';
                expect(component.hasValidGameType).toBeTrue();
            });
            it('should return false when the game type is not log2990 or classic', () => {
                component.room.roomInfo.gameType = 'ezpz';
                expect(component.hasValidGameType).toBeFalse();
            });
        });
        describe('isFormValid tests', () => {
            it('should return false when no dictionary is selected', () => {
                spyOn(component, 'isDictionarySelected' as any).and.returnValue(false);
                expect(component.isFormValid).toBeFalse();
            });
        });
        describe('isDictionarySelectedTests', () => {
            it('should return false when the value of the dictionary is ""', () => {
                component.gameForm?.controls.dictionary.setValue('');
                const result = component['isDictionarySelected']();
                expect(result).toBeFalse();
            });
            it('should return false when the value of the dictionary is not ""', () => {
                component.gameForm?.controls.dictionary.setValue('hello');
                const result = component['isDictionarySelected']();
                expect(result).toBeTrue();
            });
            it('should return false when the gameForm is undefined', () => {
                component.gameForm = undefined;
                expect(component['isDictionarySelected']()).toBeFalse();
            });
        });
        describe('dictionaryExists direct tests', () => {
            it('should return false when the game form is undefined', () => {
                component.gameForm = undefined;
                expect(component['dictionaryExists']()).toBeFalse();
            });
            it('should return false when the dictionary is ""', () => {
                component.gameForm?.controls.dictionary.setValue('');
                expect(component['dictionaryExists']()).toBeFalse();
            });
            it('should return true when the dictionary is not ""', () => {
                component.gameForm?.controls.dictionary.setValue('snoop');
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
        describe('gameForm tests', () => {
            it('should set the pseudo of its room to the pseudo value of the form on joinRoom', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                await component.joinRoom();
                const formPseudo = gameFormStub.controls.pseudo as FormControl;
                expect(component.room.players[0].pseudo).toEqual(formPseudo.value);
            });
            it('should set the timerPerTurn of its room to the timerPerTurn value of the form on joinRoom', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                await component.joinRoom();
                const formTimerPerTurn = gameFormStub.controls.timerPerTurn as FormControl;
                expect(component.room.roomInfo.timerPerTurn).toEqual(formTimerPerTurn.value);
            });
            it('should set the dictionary of its room to the dictionary value of the form on joinRoom', async () => {
                spyOn(component, 'dictionarySelectedExists' as any).and.returnValue(of(true));
                await component.joinRoom();
                const formDictionary = gameFormStub.controls.dictionary as FormControl;
                expect(component.room.roomInfo.dictionary).toEqual(formDictionary.value);
            });
        });
    });
});
