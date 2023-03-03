import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HTMLElementMock } from '@app/classes/test-helpers/html-element-mock';
import { DEFAULT_ROOM_INFO } from '@app/constants/constants';
import { SocketEvent } from '@app/enums/socket-event';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameJoinMultiplayerPageComponent } from './game-join-multiplayer-page.component';
import SpyObj = jasmine.SpyObj;

describe('GameJoinMultiplayerPageComponent', () => {
    let component: GameJoinMultiplayerPageComponent;
    let fixture: ComponentFixture<GameJoinMultiplayerPageComponent>;

    let socketServiceMock: SocketClientServiceMock;
    let routerSpy: SpyObj<Router>;
    let socketHelper: SocketTestHelper;
    let roomMock: Room;
    let sameGameTypeRoom1: Room;
    let sameGameTypeRoom2: Room;
    let player: Player;
    let playerService: PlayerService;
    // we want to test private methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let componentPrivateAccess: any;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);

        playerService = new PlayerService();
        playerService.room.roomInfo = DEFAULT_ROOM_INFO;
        playerService.room.currentPlayerPseudo = '';

        roomMock = new Room();
        roomMock.roomInfo = DEFAULT_ROOM_INFO;
        roomMock.roomInfo.name = 'Room2';
        roomMock.roomInfo.gameType = 'log2990';
        roomMock.currentPlayerPseudo = '';

        sameGameTypeRoom1 = new Room();
        sameGameTypeRoom1.roomInfo = DEFAULT_ROOM_INFO;
        roomMock.roomInfo.name = 'Room3';
        sameGameTypeRoom1.currentPlayerPseudo = '';

        sameGameTypeRoom2 = new Room();
        sameGameTypeRoom2.roomInfo = DEFAULT_ROOM_INFO;
        roomMock.roomInfo.name = 'Room4';
        sameGameTypeRoom2.currentPlayerPseudo = '';

        player = new Player();
        player.pseudo = 'playerPseudo';
        roomMock.players = [player];

        await TestBed.configureTestingModule({
            declarations: [GameJoinMultiplayerPageComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: PlayerService, useValue: playerService },
                { provide: Router, useValue: routerSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameJoinMultiplayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.availableRooms = [];
        // component.pseudo = '';
        componentPrivateAccess = component;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create multiple spy methods', () => {
        expect(routerSpy.navigate).toBeDefined();
    });

    describe('Receiving events', () => {
        describe('sockets configurations tests', () => {
            it('should set the room to the serverRoom on playerAccepted', () => {
                socketHelper.peerSideEmit(SocketEvent.PlayerAccepted, roomMock);
                expect(component.room.roomInfo.name).toEqual(roomMock.roomInfo.name);
                expect(component.room.roomInfo.timerPerTurn).toEqual(roomMock.roomInfo.timerPerTurn);
                expect(component.room.roomInfo.dictionary).toEqual(roomMock.roomInfo.dictionary);
                expect(component.room.roomInfo.gameType).toEqual(roomMock.roomInfo.gameType);
                expect(component.room.players).toEqual(roomMock.players);
            });

            it('should call joinChatChannel with correct info on playerAccepted', () => {
                socketServiceMock.send = jasmine.createSpy();
                socketHelper.peerSideEmit(SocketEvent.PlayerAccepted, roomMock);
                expect(socketServiceMock.send).toHaveBeenCalledWith(SocketEvent.JoinChatChannel, {
                    name: roomMock.roomInfo.name,
                    user: component.playerService.player.pseudo,
                });
            });

            it('should move the player to game wait page on playerAccepted', () => {
                socketHelper.peerSideEmit(SocketEvent.PlayerAccepted, roomMock);
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/multiplayer/wait']);
            });

            it('should call leaveRoom on playerRejected', () => {
                component.leaveRoom = jasmine.createSpy();
                socketHelper.peerSideEmit('playerRejected', roomMock);
                expect(component.leaveRoom).toHaveBeenCalledWith(roomMock.roomInfo.name);
            });

            it('should change availableRooms on updateAvailableRoom', () => {
                const rooms = [roomMock];
                socketHelper.peerSideEmit('updateAvailableRoom', rooms);
                expect(component.availableRooms).toEqual(rooms);
            });
        });

        describe('popup tests', () => {
            const htmlDivElementMock = new HTMLElementMock() as unknown as HTMLDivElement;

            it('should set the selectedRoom correctly on openPasswordPopup()', () => {
                component.openPasswordPopup(roomMock, htmlDivElementMock, htmlDivElementMock);
                expect(component.selectedRoom).toEqual(roomMock);
            });
        });

        describe('joinRoom and AskToJoinRoom tests', () => {
            it('should call sendJoinRoomRequest() on joinRoom()', () => {
                componentPrivateAccess.sendJoinRoomRequest = jasmine.createSpy();
                component.joinRoom('', roomMock);
                expect(componentPrivateAccess.sendJoinRoomRequest).toHaveBeenCalledWith(roomMock, '');
            });

            it('should call sendJoinRoomRequest() on askToJoin() if room is private', () => {
                roomMock.roomInfo.isPublic = false;
                componentPrivateAccess.sendJoinRoomRequest = jasmine.createSpy();
                component.askToJoinRoom(roomMock);
                expect(componentPrivateAccess.sendJoinRoomRequest).toHaveBeenCalledWith(roomMock, '');
            });

            it('should not call sendJoinRoomRequest() on askToJoin() if room is public', () => {
                roomMock.roomInfo.isPublic = true;
                componentPrivateAccess.sendJoinRoomRequest = jasmine.createSpy();
                component.askToJoinRoom(roomMock);
                expect(componentPrivateAccess.sendJoinRoomRequest).not.toHaveBeenCalled();
            });
        });

        describe('canJoinCreatorRoom tests', () => {
            it('should return true on canJoinCreatorRoom() if room.players < max', () => {
                component.canJoinRoom = true;
                roomMock.players = [player, player];
                expect(componentPrivateAccess.canJoinCreatorRoom(roomMock)).toEqual(true);
                expect(component.canJoinRoom).toBeTruthy();
            });

            it('should return false on canJoinCreatorRoom() if room.players >= max', () => {
                component.canJoinRoom = true;
                roomMock.players = [player, player, player, player];
                expect(componentPrivateAccess.canJoinCreatorRoom(roomMock)).toEqual(false);
                expect(component.canJoinRoom).toBeFalsy();
            });

            it('should return false on canJoinCreatorRoom() if room.players === 0', () => {
                component.canJoinRoom = true;
                roomMock.players = [];
                expect(componentPrivateAccess.canJoinCreatorRoom(roomMock)).toEqual(false);
                expect(component.canJoinRoom).toBeFalsy();
            });

            it('should remove the room from availableRooms if room.players >= max on askToJoin()', () => {
                roomMock.players = [player, player, player, player];
                component.availableRooms = [roomMock];
                const previousAvailableRoomsLength = component.availableRooms.length;
                componentPrivateAccess.canJoinCreatorRoom(roomMock);
                expect(component.availableRooms.length).toEqual(previousAvailableRoomsLength - 1);
            });

            it('should remove the room from availableRooms if room.players === 0 on askToJoin()', () => {
                roomMock.players = [];
                component.availableRooms = [roomMock];
                const previousAvailableRoomsLength = component.availableRooms.length;
                componentPrivateAccess.canJoinCreatorRoom(roomMock);
                expect(component.availableRooms.length).toEqual(previousAvailableRoomsLength - 1);
            });
        });

        describe('sendJoinRoomRequest tests', () => {
            it('it should set attributes correctly on joinRoom()', () => {
                component.isRejected = true;
                component.isPseudoValid = false;
                component.isInRoom = false;
                component.playerService.player.isCreator = true;
                component.playerService.player.socketId = '';

                componentPrivateAccess.sendJoinRoomRequest(roomMock, '');
                expect(component.isRejected).toBeFalsy();
                expect(component.isPseudoValid).toBeTruthy();
                expect(component.isInRoom).toBeTruthy();
                expect(component.playerService.player.isCreator).toBeFalsy();
                expect(component.playerService.player.socketId).toEqual(socketServiceMock.socket.id);
            });

            it('should call socketService.send with good params on joinRoom()', () => {
                socketServiceMock.send = jasmine.createSpy();
                const joinRoomForm = { roomName: roomMock.roomInfo.name, player: component.playerService.player, password: '' };
                componentPrivateAccess.sendJoinRoomRequest(roomMock, '');
                expect(socketServiceMock.send).toHaveBeenCalledWith(SocketEvent.JoinRoomRequest, joinRoomForm);
            });

            it('should remove the room from the list of available room on joinRoom()', () => {
                component.availableRooms = [roomMock];
                const previousAvailableRoomsLength = component.availableRooms.length;
                componentPrivateAccess.sendJoinRoomRequest(roomMock, '');
                expect(component.availableRooms.length).toEqual(previousAvailableRoomsLength - 1);
            });
        });

        describe('Available rooms tests', () => {
            it('should call socketServiceMock.send on getAvailableRooms', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.getAvailableRooms();
                expect(socketServiceMock.send).toHaveBeenCalled();
            });
        });

        describe('leaveRoom tests', () => {
            it('should call socketService.send on leaveRoom()', () => {
                socketServiceMock.send = jasmine.createSpy();
                component.leaveRoom(roomMock.roomInfo.name);
                expect(socketServiceMock.send).toHaveBeenCalledWith(SocketEvent.LeaveRoomOther, roomMock.roomInfo.name);
            });

            it('should set isInRoom to false on leaveRoom()', () => {
                component.isInRoom = true;
                component.leaveRoom(roomMock.roomInfo.name);
                expect(component.isInRoom).toEqual(false);
            });

            it('should set isRejected to true on leaveRoom()', () => {
                component.isRejected = false;
                component.leaveRoom(roomMock.roomInfo.name);
                expect(component.isRejected).toEqual(true);
            });

            it('should call room.reinitialize on leaveRoom()', () => {
                component.playerService.room = roomMock;
                component.room.reinitialize = jasmine.createSpy();
                component.leaveRoom(roomMock.roomInfo.name);
                expect(component.room.reinitialize).toHaveBeenCalledWith(component.room.roomInfo.gameType);
            });
        });
    });
});
