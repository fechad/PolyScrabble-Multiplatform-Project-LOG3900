/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods
/* eslint-disable max-lines */ // we want to make sure that we did not forget any valuable tests
/* eslint-disable dot-notation */ // we want to access private attribute to test
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { JoinRoomForm } from '@app/interfaces/join-room-form';
import { assert, expect } from 'chai';
import * as http from 'http';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketRoomService } from './socket-room.service';

describe('socketRoomService service tests', () => {
    let isRoomNameValidStub: sinon.SinonStub;
    let getRoomStub: sinon.SinonStub;
    let getPlayerStub: sinon.SinonStub;
    let getPlayerByNameStub: sinon.SinonStub;
    let removePlayerStub: sinon.SinonStub;

    const socketRoomService = new SocketRoomService(
        new DiscussionChannelService(),
        new io.Server(http.createServer(), { cors: { origin: '*', methods: ['GET', 'POST'] } }),
        new ScoresService({} as any),
        new PlayerGameHistoryService({} as any),
        new GamesHistoryService({} as any),
        new ChatMessageService(),
        new RoomService(),
        new DateService(),
    );
    const firstPlayer = new Player('socketId1', 'pseudo1', true);
    const secondPlayer = new Player('socketId2', 'pseudo2', false);
    const roomMock = new Room();
    roomMock.roomInfo.name = 'R-0';
    roomMock.bots = [
        {
            playTurn: () => {
                return '' as any;
            },
        } as VirtualPlayer,
    ];
    const socketMock = new SocketMock() as any;

    beforeEach(() => {
        isRoomNameValidStub = sinon.stub(socketRoomService.roomService, 'isRoomNameValid').returns(true);
        getRoomStub = sinon.stub(socketRoomService.roomService, 'getRoom').returns(roomMock);
        sinon.stub(roomMock, 'changePlayerTurn').callsFake(() => {
            return;
        });
        sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(firstPlayer);
        sinon.stub(socketRoomService, 'getSocketRoom').returns(roomMock);
        sinon.stub(socketRoomService.commandController, 'hasCommandSyntax').returns(true);
        sinon.stub(socketRoomService.commandController, 'executeCommand').returns(undefined);
        getPlayerStub = sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
        getPlayerByNameStub = sinon.stub(roomMock, 'getPlayerByName').returns(firstPlayer);
        removePlayerStub = sinon.stub(roomMock, 'removePlayer').callsFake(() => {
            return;
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleCreateRoom event tests', () => {
        it('Should handle room creation correctly on handleCreateRoom', (done) => {
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
            socketRoomService.handleCreateRoom(socketMock, roomMock);
            assert(spy1.called, 'did not call roomService.createRoom on joinRoom');
            assert(spy2.called, 'did not call socketRoomService.socketJoin on joinRoom');
            assert(stub1.called, 'did not call socketRoomService.sendToEveryoneInRoom on joinRoom');
            assert(stub2.called, 'did not call socketRoomService.sendToEveryone on joinRoom');
            done();
        });

        it('Should not call createRoom on handleCreateRoom if room does not exist', (done) => {
            const spy = sinon.stub(socketRoomService.roomService, 'createRoom').callsFake(() => {
                return roomMock;
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test undefined as parameter
            socketRoomService.handleCreateRoom(socketMock, undefined as any);
            assert(spy.notCalled, 'called roomService.createRoom on handleCreateRoom with an empty room');
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

    describe('handleJoinRequest tests', () => {
        let joinRoomForm: JoinRoomForm;
        beforeEach(() => {
            joinRoomForm = { roomName: roomMock.roomInfo.name, player: firstPlayer, password: '' };
            roomMock.players = [firstPlayer];
        });

        it('Should add the socket a room on handleJoinRequest', (done) => {
            const spy1 = sinon.spy(socketRoomService, 'socketJoin');
            const spy2 = sinon.spy(roomMock, 'addPlayer');
            socketRoomService.handleJoinRequest(socketMock, joinRoomForm);
            assert(spy1.called, 'did not call socketJoin on handleJoinRequest');
            assert(spy2.called, 'did not call roomMock.addPlayer on handleJoinRequest');
            done();
        });

        it('Should not add the socket a room on handleJoinRequest if the room is undefined', (done) => {
            const spy = sinon.spy(socketRoomService.roomService, 'setUnavailable');
            joinRoomForm.roomName = '';
            getRoomStub.restore();
            getRoomStub = sinon.stub(socketRoomService.roomService, 'getRoom').returns(undefined);
            socketRoomService.handleJoinRequest(socketMock, joinRoomForm);
            const newRoomSize = socketRoomService.sio.sockets.adapter.rooms.get(roomMock.roomInfo.name)?.size;
            expect(newRoomSize).to.equal(undefined);
            assert(spy.notCalled, 'Called roomService.setUnavailable on handleJoinRequest even if the room was undefined');
            done();
        });

        it('should increase the number of players  on handleJoinRequest', (done) => {
            roomMock.players = [firstPlayer];
            const previousPlayersLength = roomMock.players.length;
            socketRoomService.handleJoinRequest(socketMock, joinRoomForm);
            expect(roomMock.players.length).to.equal(previousPlayersLength + 1);
            done();
        });

        it('should increase the number of unavailableRoom and decrease the number of AvailableRooms on handleJoinRequest', (done) => {
            socketRoomService.roomService.roomsUnavailable = [];
            socketRoomService.roomService.roomsAvailable = [roomMock];
            const numberOfUnavailableRooms = socketRoomService.roomService.getRoomsUnavailable().length;
            const numberOfAvailableRooms = socketRoomService.roomService.getRoomsAvailable().length;
            roomMock.players = [firstPlayer, firstPlayer, firstPlayer];
            const canAddPlayerStub = sinon.stub(roomMock, 'canAddPlayer').returns(true);

            socketRoomService.handleJoinRequest(socketMock, joinRoomForm);

            assert(canAddPlayerStub.called, 'did not call room.canAddPlayerStub on handleJoinRequest');
            expect(socketRoomService.roomService.getRoomsUnavailable().length).to.equal(numberOfUnavailableRooms + 1);
            expect(socketRoomService.roomService.getRoomsAvailable().length).to.equal(numberOfAvailableRooms - 1);
            done();
        });
    });

    describe('rejectPlayer', () => {
        beforeEach(() => {
            roomMock.players = [firstPlayer];
        });

        it('Should emit playerRejected to the room on rejectPlayer', (done) => {
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleRejectPlayer(socketMock, { roomName: roomMock.roomInfo.name, playerName: firstPlayer.pseudo });
            assert(spy.called, 'did not call socketEmitRoom on rejectPlayer');
            done();
        });

        it('Should not emit playerRejected on rejectPlayer if the room is undefined', (done) => {
            getRoomStub.restore();
            getRoomStub.returns(undefined);
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleRejectPlayer(socketMock, { roomName: '', playerName: firstPlayer.pseudo });
            assert(spy.notCalled, 'Called socketEmitRoom on rejectPlayer even if the room was undefined');
            done();
        });

        it('Should not emit playerRejected on rejectPlayer if the player is undefined', (done) => {
            getPlayerByNameStub.restore();
            getPlayerByNameStub.returns(undefined);
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleRejectPlayer(socketMock, { roomName: roomMock.roomInfo.name, playerName: '' });
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

    describe('acceptPlayer test', () => {
        beforeEach(() => {
            roomMock.players = [firstPlayer];
        });

        it('should send to everyone in room if the roomName is valid ', (done) => {
            const spy = sinon.spy(socketRoomService, 'sendToEveryoneInRoom');
            socketRoomService.handleAcceptPlayer(socketMock, { roomName: roomMock.roomInfo.name, playerName: firstPlayer.pseudo });
            assert(spy.called, 'did not call sendToEveryoneInRoom on acceptPlayer');
            done();
        });
        it('should not emit to the room if the roomName is not valid', (done) => {
            getRoomStub.restore();
            getRoomStub.returns(undefined);
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleAcceptPlayer(socketMock, { roomName: '', playerName: firstPlayer.pseudo });
            assert(spy.notCalled, 'called socketEmitROom on acceptPlayer when roomName was not valid');
            done();
        });

        it('should not emit to the room if the player is not valid', (done) => {
            getPlayerByNameStub.restore();
            getPlayerByNameStub.returns(undefined);
            const spy = sinon.spy(socketRoomService, 'socketEmitRoom');
            socketRoomService.handleAcceptPlayer(socketMock, { roomName: roomMock.roomInfo.name, playerName: '' });
            assert(spy.notCalled, 'called socketEmitROom on acceptPlayer when roomName was not valid');
            done();
        });
    });
});
