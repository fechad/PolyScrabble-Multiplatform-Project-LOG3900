/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods
/* eslint-disable max-lines */ // we want to make sure that we did not forget any valuable tests
/* eslint-disable dot-notation */ // we want to access private attribute to test
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { assert, expect } from 'chai';
import * as http from 'http';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DatabaseServiceMock } from './database.service.mock';
import { DateService } from './date.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketRoomService } from './socket-room.service';

describe('socketRoomService service tests', () => {
    let isRoomNameValidStub: sinon.SinonStub;
    let getRoomStub: sinon.SinonStub;
    let getPlayerStub: sinon.SinonStub;
    let removePlayerStub: sinon.SinonStub;

    const socketRoomService = new SocketRoomService(
        new io.Server(http.createServer(), { cors: { origin: '*', methods: ['GET', 'POST'] } }),
        new ScoresService(new DatabaseServiceMock() as any),
        new GamesHistoryService(new DatabaseServiceMock() as any),
        new ChatMessageService(),
        new RoomService(),
        new DateService(),
    );
    const firstPlayer = new Player('socketId1', 'pseudo1', true);
    const secondPlayer = new Player('socketId2', 'pseudo2', false);
    const roomMock = new Room();
    roomMock.roomInfo.name = 'Room0';
    roomMock.bot = {
        playTurn: () => {
            return '' as any;
        },
    } as VirtualPlayer;
    const socketMock = new SocketMock() as any;

    beforeEach(() => {
        isRoomNameValidStub = sinon.stub(socketRoomService.roomService, 'isRoomNameValid').returns(true);
        getRoomStub = sinon.stub(socketRoomService.roomService, 'getRoom').returns(roomMock);
        sinon.stub(roomMock, 'changePlayerTurn').callsFake(() => {
            return;
        });
        sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(firstPlayer);
        sinon.stub(socketRoomService, 'getSocketRoom').returns(roomMock.roomInfo.name);
        sinon.stub(socketRoomService.commandController, 'hasCommandSyntax').returns(true);
        sinon.stub(socketRoomService.commandController, 'executeCommand').returns(undefined);
        getPlayerStub = sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
        removePlayerStub = sinon.stub(roomMock, 'removePlayer').callsFake(() => {
            return;
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Bot tests', () => {
        let createRoomSpy: sinon.SinonSpy;
        let socketJoinSpy: sinon.SinonSpy;
        let sendEveryoneStub: sinon.SinonStub;

        beforeEach(() => {
            createRoomSpy = sinon.stub(socketRoomService.roomService, 'createRoom').callsFake(() => {
                return roomMock;
            });
            socketJoinSpy = sinon.spy(socketRoomService, 'socketJoin');
            sendEveryoneStub = sinon.stub(socketRoomService, 'sendToEveryoneInRoom');
        });
        describe('handleJoinRoomSolo tests', () => {
            it('should call the correct methods on handleJoinRoomSolo', (done) => {
                roomMock.roomInfo.isSolo = true;
                socketRoomService.handleJoinRoomSolo(socketMock, roomMock);
                assert(createRoomSpy.called, 'did not call roomService.createRoom on handleJoinRoomSolo');
                assert(socketJoinSpy.called, 'did not call socketRoomService.socketJoin on handleJoinRoomSolo');
                assert(sendEveryoneStub.called, 'did not call socketRoomService.sendToEveryoneInRoom on handleJoinRoomSolo');
                done();
            });

            it('should not call socketJoin on handleJoinRoomSolo if there are no room', (done) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- want to set an undefined room
                const undefinedRoom: any = undefined;
                socketRoomService.handleJoinRoomSolo(socketMock, undefinedRoom);
                assert(socketJoinSpy.notCalled, 'called socketRoomService.socketJoin on handleJoinRoomSolo with empty room');
                done();
            });

            it('should not call socketJoin on handleJoinRoomSolo if the room is not a solo room', (done) => {
                roomMock.roomInfo.isSolo = false;
                socketRoomService.handleJoinRoomSolo(socketMock, roomMock);
                assert(socketJoinSpy.notCalled, 'called socketRoomService.socketJoin on handleJoinRoomSolo with a room that is not solo');
                done();
            });
        });

        describe('handleJoinRoomSoloBot tests', () => {
            it('should call the correct methods on handleJoinRoomSoloBot', (done) => {
                const createPlayerVirtualSpy = sinon.spy(roomMock, 'createPlayerVirtual');
                const setUnavailableSpy = sinon.spy(socketRoomService.roomService, 'setUnavailable');
                const sendToEveryoneSpy = sinon.spy(socketRoomService, 'sendToEveryone');

                getRoomStub.callsFake(() => {
                    return roomMock;
                });

                socketRoomService.handleJoinRoomSoloBot(socketMock, { roomName: roomMock.roomInfo.name, botName: 'bot', isExpertLevel: false });
                assert(createPlayerVirtualSpy.called, 'did not call room.createPlayerVirtual on handleJoinRoomSoloBot');
                assert(socketJoinSpy.called, 'did not call socketRoomService.socketJoin on handleJoinRoomSoloBot');
                assert(sendEveryoneStub.called, 'did not call socketRoomService.sendToEveryoneInRoom on handleJoinRoomSoloBot');
                assert(setUnavailableSpy.called, 'did not call roomService.setUnavailable on handleJoinRoomSoloBot');
                assert(sendToEveryoneSpy.called, 'did not call socketRoomService.sendToEveryone on handleJoinRoomSoloBot');
                done();
            });

            it('should not call createPlayerVirtual on handleJoinRoomSoloBot if there is no roomName', (done) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- want to set an undefined room
                const undefinedRoomName: any = undefined;
                const createPlayerVirtualSpy = sinon.spy(roomMock, 'createPlayerVirtual');

                socketRoomService.handleJoinRoomSoloBot(socketMock, { roomName: undefinedRoomName, botName: 'bot', isExpertLevel: false });
                assert(createPlayerVirtualSpy.notCalled, 'called room.createPlayerVirtual on handleJoinRoomSoloBot with an undefined roomName');
                done();
            });
            it('should not call createPlayerVirtual on handleJoinRoomSoloBot if there is no room', (done) => {
                const createPlayerVirtualSpy = sinon.spy(roomMock, 'createPlayerVirtual');
                getRoomStub.callsFake(() => {
                    return undefined;
                });
                socketRoomService.handleJoinRoomSoloBot(socketMock, { roomName: roomMock.roomInfo.name, botName: 'bot', isExpertLevel: false });
                assert(createPlayerVirtualSpy.notCalled, 'called room.createPlayerVirtual on handleJoinRoomSoloBot with an undefined room');
                done();
            });
        });
    });
    describe('JoinRoom event tests', () => {
        it('Should handle room creation correctly on joinRoom', (done) => {
            const spy1 = sinon.stub(socketRoomService.roomService, 'createRoom').callsFake(() => {
                return roomMock;
            });
            const spy2 = sinon.stub(socketRoomService, 'socketJoin').callsFake(() => {
                return;
            });
            const stub1 = sinon.stub(socketRoomService, 'sendToEveryoneInRoom').callsFake(() => {
                return;
            });
            const stub2 = sinon.stub(socketRoomService, 'sendToEveryone').callsFake(() => {
                return;
            });
            socketRoomService.handleJoinRoom(socketMock, roomMock);
            assert(spy1.called, 'did not call roomService.createRoom on joinRoom');
            assert(spy2.called, 'did not call socketRoomService.socketJoin on joinRoom');
            assert(stub1.called, 'did not call socketRoomService.sendToEveryoneInRoom on joinRoom');
            assert(stub2.called, 'did not call socketRoomService.sendToEveryone on joinRoom');
            done();
        });

        it('Should not call createRoom on joinRoom if room does not exist', (done) => {
            const spy = sinon.stub(socketRoomService.roomService, 'createRoom').callsFake(() => {
                return roomMock;
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test undefined as parameter
            socketRoomService.handleJoinRoom(socketMock, undefined as any);
            assert(spy.notCalled, 'called roomService.createRoom on joinRoom with an empty room');
            done();
        });
    });

    describe('leaveRoomCreator tests', () => {
        it('Should remove the room on leaveRoomCreator', (done) => {
            socketRoomService.roomService.roomsAvailable = [roomMock];
            socketRoomService.roomService.roomsUnavailable = [];
            const roomSize = socketRoomService.roomService.getNumberOfRooms();
            socketRoomService.handleLeaveRoomCreator(socketMock, roomMock.roomInfo.name);
            expect(socketRoomService.roomService.getNumberOfRooms()).to.equal(roomSize - 1);
            done();
        });

        it('Should not remove a room on leaveRoomCreator with an invalid room name', (done) => {
            socketRoomService.roomService.roomsAvailable = [roomMock];
            const roomSize = socketRoomService.roomService.getNumberOfRooms();
            socketRoomService.handleLeaveRoomCreator(socketMock, 'invalidName');
            expect(socketRoomService.roomService.getNumberOfRooms()).to.equal(roomSize);
            done();
        });
    });

    describe('leaveRoomOther tests', () => {
        it('Should remove the room from the socket on leaveRoomOther', (done) => {
            const spy = sinon.spy(socketRoomService, 'socketLeaveRoom');
            socketRoomService.handleLeaveRoomOther(socketMock, roomMock.roomInfo.name);
            assert(spy.called, 'did not call socketLeaveRoom');
            done();
        });

        it('Should not remove the room of roomService on leaveRoomOther', (done) => {
            socketRoomService.roomService.roomsAvailable = [roomMock];
            const roomSize = socketRoomService.roomService.getNumberOfRooms();
            socketRoomService.handleLeaveRoomOther(socketMock, roomMock.roomInfo.name);
            expect(socketRoomService.roomService.getNumberOfRooms()).to.equal(roomSize);
            done();
        });
    });

    describe('askToJoin tests', () => {
        beforeEach(() => {
            roomMock.players = [firstPlayer];
        });

        it('Should add the socket a room on askToJoin', (done) => {
            const spy1 = sinon.spy(socketRoomService, 'socketJoin');
            const spy2 = sinon.spy(roomMock, 'addPlayer');
            socketRoomService.handleAskToJoin(socketMock, roomMock);
            assert(spy1.called, 'did not call socketJoin on askToJoin');
            assert(spy2.called, 'did not call roomMock.addPlayer on askToJoin');
            done();
        });

        it('Should not add the socket a room on askToJoin if the room is undefined', (done) => {
            const spy = sinon.spy(socketRoomService.roomService, 'setUnavailable');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We must test behavior on undefined
            socketRoomService.handleAskToJoin(socketMock, undefined as any);
            const newRoomSize = socketRoomService.sio.sockets.adapter.rooms.get(roomMock.roomInfo.name)?.size;
            expect(newRoomSize).to.equal(undefined);
            assert(spy.notCalled, 'Called roomService.setUnavailable on askToJoin even if the room was undefined');
            done();
        });

        it('should increase the number of unavailableRoom and decrease the number of AvailableRooms on askToJoin', (done) => {
            socketRoomService.roomService.roomsAvailable = [roomMock];
            const numberOfUnavailableRooms = socketRoomService.roomService.getRoomsUnavailable().length;
            const numberOfAvailableRooms = socketRoomService.roomService.getRoomsAvailable().length;
            roomMock.players = [firstPlayer];

            socketRoomService.handleAskToJoin(socketMock, roomMock);
            expect(socketRoomService.roomService.getRoomsUnavailable().length).to.equal(numberOfUnavailableRooms + 1);
            expect(socketRoomService.roomService.getRoomsAvailable().length).to.equal(numberOfAvailableRooms - 1);
            done();
        });
    });

    describe('rejectPlayer', () => {
        it('Should emit playerRejected to the room on rejectPlayer', (done) => {
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleRejectPlayer(socketMock, roomMock);
            assert(spy.called, 'did not call socketEmitRoom on rejectPlayer');
            done();
        });

        it('Should not emit playerRejected on rejectPlayer if the room is undefined', (done) => {
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We must test behavior on undefined
            socketRoomService.handleRejectPlayer(socketMock, undefined as any);
            assert(spy.notCalled, 'Called socketEmitRoom on rejectPlayer even if the room was undefined');
            done();
        });
    });

    describe('SetRoomAvailable tests', () => {
        it('should call the correct methods on setRoomAvailable', (done) => {
            const spy1 = sinon.spy(socketRoomService.roomService, 'setAvailable');
            const spy2 = sinon.spy(socketRoomService.sio.sockets, 'emit');
            socketRoomService.handleSetRoomAvailable(socketMock, roomMock.roomInfo.name);
            assert(spy1.called, 'did not call socketRoomService.roomService.setAvailable on setAvailable');
            assert(spy2.called, 'did not call sio.sockets.emits on setAvailable');
            done();
        });
    });

    describe('availableRooms tests', () => {
        it('Should call socketRoomService.sio.to on availableRooms', (done) => {
            const spy = sinon.spy(socketRoomService.sio, 'to');
            socketRoomService.handleAvailableRooms(socketMock);
            assert(spy.called, 'did not call socketRoomService.sio.to on joinRoom');
            done();
        });
    });

    describe('leaveRoomOther tests', () => {
        it('Should call the correct methods on leaveRoomOther', (done) => {
            roomMock.players = [firstPlayer, secondPlayer];
            const socketsEmitStub = sinon.stub(socketRoomService.sio.sockets, 'emit').callsFake(() => {
                return false;
            });
            socketRoomService.handleLeaveRoomOther(socketMock, roomMock.roomInfo.name);
            assert(isRoomNameValidStub.called, 'did not call socketRoomService.isRoomNameValid on leaveRoomOther');
            assert(getRoomStub.called, 'did not call socketRoomService.roomService.getRoom on leaveRoomOther');
            assert(getPlayerStub.called, 'did not call roomMock.getPlayer on leaveRoomOther');
            assert(removePlayerStub.called, 'did not call roomMock.removePlayer on leaveRoomOther');
            assert(socketsEmitStub.called, 'did not call sio.sockets.emit on leaveRoomOther');
            done();
        });
    });

    describe('askToJoin tests', () => {
        beforeEach(() => {
            roomMock.players = [firstPlayer];
        });
        it('Should call setUnavailable on askToJoin', (done) => {
            roomMock.players = [firstPlayer];

            const spy1 = sinon.spy(socketRoomService.roomService, 'setUnavailable');
            const spy2 = sinon.spy(socketRoomService.roomService, 'getRoomsAvailable');
            socketRoomService.handleAskToJoin(socketMock, roomMock);
            assert(spy1.called, 'did not call roomService.setUnavailable on askToJoin');
            assert(spy2.called, 'did not call roomService.getRoomsAvailable on askToJoin');
            done();
        });
    });

    describe('acceptPlayer test', () => {
        it('should emit to the room if the roomName is valid ', (done) => {
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleAcceptPlayer(socketMock, roomMock);
            assert(isRoomNameValidStub.called, 'did not call socketRoomService.isRoomNameValid on acceptPlayer');
            assert(spy.called, 'did not call socketEmitROom on acceptPlayer');
            done();
        });
        it('should not emit to the room if the roomName is not valid', (done) => {
            isRoomNameValidStub.callsFake(() => {
                return false;
            });
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleAcceptPlayer(socketMock, roomMock);
            assert(isRoomNameValidStub.called, 'did not call socketRoomService.isRoomNameValid on acceptPlayer');
            assert(spy.notCalled, 'called socketEmitROom on acceptPlayer when roomName was not valid');
            done();
        });
    });
});
