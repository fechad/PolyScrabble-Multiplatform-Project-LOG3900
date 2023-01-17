import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import {
    GAME_REJECTION_BY_ADVERSARY,
    INVALID_PSEUDO,
    INVALID_PSEUDO_LENGTH,
    ROOM_ERROR,
    WAITING_FOR_CONFIRMATION,
} from '@app/constants/status-constants';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { GameJoinMultiplayerPageComponent } from './game-join-multiplayer-page.component';
import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('GameJoinMultiplayerPageComponent', () => {
    let component: GameJoinMultiplayerPageComponent;
    let fixture: ComponentFixture<GameJoinMultiplayerPageComponent>;

    let socketServiceMock: SocketClientServiceMock;
    let routerSpy: SpyObj<Router>;
    let socketHelper: SocketTestHelper;
    let componentRoom: Room;
    let roomMock: Room;
    let sameGameTypeRoom1: Room;
    let sameGameTypeRoom2: Room;
    let player: Player;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        componentRoom = new Room();
        componentRoom.roomInfo = { name: '', timerPerTurn: '', dictionary: '', gameType: 'classic', maxPlayers: 2 };
        componentRoom.currentPlayerPseudo = '';

        roomMock = new Room();
        roomMock.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'log2990', maxPlayers: 2 };
        roomMock.currentPlayerPseudo = '';

        sameGameTypeRoom1 = new Room();
        sameGameTypeRoom1.roomInfo = { name: 'sameType1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        sameGameTypeRoom1.currentPlayerPseudo = '';

        sameGameTypeRoom2 = new Room();
        sameGameTypeRoom2.roomInfo = { name: 'sameType2', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        sameGameTypeRoom2.currentPlayerPseudo = '';

        player = new Player();
        player.pseudo = 'playerPseudo';
        roomMock.players = [player];

        await TestBed.configureTestingModule({
            declarations: [GameJoinMultiplayerPageComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Router, useValue: routerSpy },
                { provide: Room, useValue: componentRoom },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameJoinMultiplayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.availableRooms = [];
        component.pseudo = '';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('Receiving events', () => {
        describe('Connection tests', () => {
            // we want to test private methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
                const spy = spyOn(socketServiceMock, 'isSocketAlive');
                componentPrivateAccess.connect();
                expect(spy).toHaveBeenCalled();
            });

            it('should call configureBaseSocketFeatures on connection', () => {
                componentPrivateAccess.configureBaseSocketFeatures = jasmine.createSpy();
                componentPrivateAccess.connect();
                expect(componentPrivateAccess.configureBaseSocketFeatures).toHaveBeenCalled();
            });
        });

        describe('Available rooms tests', () => {
            it('should change availableRooms on updateAvailableRoom signal', () => {
                const rooms = [roomMock];
                socketHelper.peerSideEmit('updateAvailableRoom', rooms);
                expect(component.availableRooms.length).toEqual(1);
            });
            it('should call socketServiceMock.send on getAvailableRooms', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.getAvailableRooms();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });
        });

        describe('askToJoin tests', () => {
            const validPseudo = 'valid';
            it('should call socketServiceMock.send on askToJoin if component.pseudo is valid', () => {
                component.pseudo = validPseudo;
                socketServiceMock.send = jasmine.createSpy();
                component.askToJoin(roomMock);
                expect(socketServiceMock.send).toHaveBeenCalled();
            });

            it('should leave the askToJoin method if component.pseudo is not valid', () => {
                component.pseudo = 'invalidPseudoDueToHighLength';
                socketServiceMock.send = jasmine.createSpy();
                component.askToJoin(roomMock);
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });

            it('should set isInRoom when the player join room if component.pseudo is valid', () => {
                component.pseudo = validPseudo;
                component.askToJoin(roomMock);
                expect(component.isInRoom).toEqual(true);
            });

            it('should delete a room when the player ask to join a room if component.pseudo is valid', () => {
                component.pseudo = validPseudo;
                component.availableRooms = [roomMock];
                const nAvailableRooms = component.availableRooms.length;
                component.askToJoin(roomMock);
                expect(component.availableRooms.length).toEqual(nAvailableRooms - 1);
            });

            it('should not call askToJoin if the room is empty', () => {
                roomMock.players = [];
                socketServiceMock.send = jasmine.createSpy();
                component.askToJoin(roomMock);
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });

            it('should not call askToJoin if the room is full', () => {
                roomMock.players = [player, player];
                socketServiceMock.send = jasmine.createSpy();
                component.askToJoin(roomMock);
                expect(socketServiceMock.send).not.toHaveBeenCalled();
            });
        });

        describe('joinRandomRoom tests', () => {
            it('should call askToJoin on joinRandomRoom and chose between room with same game type', () => {
                const roomsWithSameGameType = [sameGameTypeRoom1, sameGameTypeRoom2];
                component.availableRooms = [sameGameTypeRoom1, sameGameTypeRoom2, roomMock];
                const spy1 = spyOn(component, 'askToJoin');
                const spy2 = spyOn(Math, 'random');
                component.joinRandomRoom();
                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
                expect(component.roomsWithMyGameType.length).toEqual(roomsWithSameGameType.length);
            });

            it('should not call askToJoin on joinRandomRoom if there are no rooms with same game type', () => {
                component.availableRooms = [roomMock];
                const spy1 = spyOn(component, 'askToJoin');
                const spy2 = spyOn(Math, 'random');
                component.joinRandomRoom();
                expect(spy1).not.toHaveBeenCalled();
                expect(spy2).not.toHaveBeenCalled();
                expect(component.roomsWithMyGameType.length).toEqual(0);
            });
            describe('canJoinCreatorRoom function tests', () => {
                it('should return false when there is an empty room', () => {
                    component.canJoinRoom = true;
                    const roomTo = new Room();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test private method
                    const componentPrivateAccess = component as any;
                    componentPrivateAccess.canJoinCreatorRoom(roomTo);
                    expect(component.canJoinRoom).toBeFalsy();
                });
            });
        });

        describe('playerAccepted tests', () => {
            it('should call router.navigate if the player is accepted', () => {
                socketHelper.peerSideEmit('playerAccepted', roomMock);
                expect(routerSpy.navigate).toHaveBeenCalled();
            });

            it('should make the room.currentPlayerPseudo = to the component pseudo', () => {
                component.pseudo = 'componentPseudo';
                socketHelper.peerSideEmit('playerAccepted', roomMock);
                expect(component.room.currentPlayerPseudo).toEqual(component.pseudo);
            });

            it('should make the component.room = to the creatorRoom', () => {
                socketHelper.peerSideEmit('playerAccepted', roomMock);
                roomMock.currentPlayerPseudo = component.pseudo;
                expect(component.room.roomInfo.name).toEqual(roomMock.roomInfo.name);
                expect(component.room.roomInfo.timerPerTurn).toEqual(roomMock.roomInfo.timerPerTurn);
                expect(component.room.roomInfo.dictionary).toEqual(roomMock.roomInfo.dictionary);
                expect(component.room.roomInfo.gameType).toEqual(roomMock.roomInfo.gameType);
                expect(component.room.players).toEqual(roomMock.players);
            });
        });

        describe('playerRejected tests', () => {
            it('should call socketService.send if the player is rejected', () => {
                socketServiceMock.send = jasmine.createSpy();
                socketHelper.peerSideEmit('playerRejected', roomMock);
                expect(socketServiceMock.send).toHaveBeenCalled();
            });

            it('should make the component room name empty if the player is rejected', () => {
                socketHelper.peerSideEmit('playerRejected', roomMock);
                expect(component.room.roomInfo.name).toEqual('');
            });

            it('should set isInRoom to false if the player is rejected', () => {
                socketHelper.peerSideEmit('playerRejected', roomMock);
                expect(component.isInRoom).toEqual(false);
            });
        });
    });

    describe('hasValidName tests', () => {
        const validPseudo = 'f'.repeat(MIN_LENGTH_PSEUDO + 1);
        const invalidPseudo = 's'.repeat(MAX_LENGTH_PSEUDO + 1);
        it('should return true if this.pseudo >= minChar and <= maxChar', () => {
            component.pseudo = validPseudo;
            expect(component.hasValidName).toBeTruthy();
        });
        it('should return false if this.pseudo > maxChar', () => {
            component.pseudo = invalidPseudo;
            expect(component.hasValidName).toBeFalsy();
        });
        it('should return false if this.pseudo.length < minChar ', () => {
            component.pseudo = 's'.repeat(MIN_LENGTH_PSEUDO - 1);
            expect(component.hasValidName).toBeFalsy();
        });
    });
    describe('roomStatusText tests', () => {
        it('should return WAITING_FOR_CONFIRMATION when the player is in a room', () => {
            component.isInRoom = true;
            expect(component.roomStatusText).toEqual(WAITING_FOR_CONFIRMATION);
        });
        it('should return GAME_REJECTION_BY_AVERSARY when the player has been rejected', () => {
            component.isInRoom = false;
            component.isRejected = true;
            expect(component.roomStatusText).toEqual(GAME_REJECTION_BY_ADVERSARY);
        });
        it('should return INVALID_PSEUDO_LENGTH when the player simpliy does not have the right pseudo length to join game', () => {
            component.isInRoom = false;
            component.isRejected = false;
            component.pseudo = 'c'.repeat(MAX_LENGTH_PSEUDO + 1);
            expect(component.roomStatusText).toEqual(INVALID_PSEUDO_LENGTH);
        });
        it('should return INVALID PSEUDO when the pseudo is invalid', () => {
            component.isInRoom = false;
            component.isRejected = false;
            component.pseudo = 'c'.repeat(MIN_LENGTH_PSEUDO + 1);
            component.isPseudoValid = false;
            expect(component.roomStatusText).toEqual(INVALID_PSEUDO);
        });
        it('should return ROOM_ERROR when the user cannot join a room because it is full or it does not exist', () => {
            component.isInRoom = false;
            component.isRejected = false;
            component.pseudo = 'c'.repeat(MIN_LENGTH_PSEUDO + 1);
            component.isPseudoValid = true;
            component.canJoinRoom = false;
            expect(component.roomStatusText).toEqual(ROOM_ERROR);
        });
        it('should return "" when we hit the default case', () => {
            component.isInRoom = false;
            component.isRejected = false;
            component.pseudo = 'c'.repeat(MIN_LENGTH_PSEUDO + 1);
            component.isPseudoValid = true;
            component.canJoinRoom = true;
            expect(component.roomStatusText).toEqual('');
        });
    });
});
