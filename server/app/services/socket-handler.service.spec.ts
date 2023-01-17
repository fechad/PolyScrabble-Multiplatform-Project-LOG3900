/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods

/* eslint-disable dot-notation */ // we want to access private attribute to test them
/* eslint-disable max-lines */
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DISCONNECT_DELAY } from '@app/constants/constants';
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
import { SocketHandlerService } from './socket-handler.service';
const RESPONSE_DELAY = 200;
describe('SocketHandler service tests', () => {
    let getRoomStub: sinon.SinonStub;
    let getSocketRoomStub: sinon.SinonStub;
    let getPlayerStub: sinon.SinonStub;

    const socketHandlerService = new SocketHandlerService(
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
    const socketMock = new SocketMock() as any;
    const playerData = { socketId: 'testId', roomName: 'Room1' };

    beforeEach(() => {
        sinon.stub(socketHandlerService.roomService, 'isRoomNameValid').returns(true);
        getRoomStub = sinon.stub(socketHandlerService.roomService, 'getRoom').returns(roomMock);
        sinon.stub(roomMock, 'changePlayerTurn').callsFake(() => {
            return;
        });
        sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(firstPlayer);
        getSocketRoomStub = sinon.stub(socketHandlerService, 'getSocketRoom').returns(roomMock.roomInfo.name);
        sinon.stub(socketHandlerService.commandController, 'hasCommandSyntax').returns(true);
        sinon.stub(socketHandlerService.commandController, 'executeCommand').returns(undefined);
        getPlayerStub = sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
        sinon.stub(roomMock, 'removePlayer').callsFake(() => {
            return;
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleConvertToRoomSoloBot tests', () => {
        it('should not call createPlayerVirtual on handleJoinRoomSoloBot if there is no roomName', (done) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- want to set an undefined room
            const undefinedRoomName: any = undefined;
            const createPlayerVirtualSpy = sinon.spy(roomMock, 'createPlayerVirtual');

            socketHandlerService.handleConvertToRoomSoloBot(socketMock, {
                roomName: undefinedRoomName,
                botName: 'bot',
                points: 0,
                isExpertLevel: false,
            });
            assert(createPlayerVirtualSpy.notCalled, 'called room.createPlayerVirtual on handleJoinRoomSoloBot with an undefined roomName');
            done();
        });
        it('should not call createPlayerVirtual on handleJoinRoomSoloBot if there is no room', (done) => {
            const createPlayerVirtualSpy = sinon.spy(roomMock, 'createPlayerVirtual');
            getRoomStub.callsFake(() => {
                return undefined;
            });
            socketHandlerService.handleConvertToRoomSoloBot(socketMock, {
                roomName: roomMock.roomInfo.name,
                botName: 'bot',
                points: 0,
                isExpertLevel: false,
            });
            assert(createPlayerVirtualSpy.notCalled, 'called room.createPlayerVirtual on handleJoinRoomSoloBot with an undefined room');
            done();
        });
        it('should call the correct methods on handleJoinRoomSolo', (done) => {
            const sendEveryoneStub = sinon.stub(socketHandlerService, 'sendToEveryoneInRoom').callsFake(() => {
                return;
            });
            roomMock.roomInfo.isSolo = true;
            socketHandlerService.handleConvertToRoomSoloBot(socketMock, {
                roomName: roomMock.roomInfo.name,
                botName: 'bot',
                points: 0,
                isExpertLevel: false,
            });
            assert(sendEveryoneStub.called, 'did not call socketRoomService.sendToEveryoneInRoom on handleJoinRoomSolo');
            done();
        });
    });
    describe('disconnecting tests', () => {
        it('should not disconnect after 5 second if the room.length is <= 1', (done) => {
            roomMock.players = [firstPlayer];
            const removeRoomSpy = sinon.spy(socketHandlerService.roomService, 'removeRoom');
            const sendEveryoneStub = sinon.stub(socketHandlerService, 'sendToEveryoneInRoom').callsFake(() => {
                return;
            });
            const sendToEveryoneSpy = sinon.spy(socketHandlerService, 'sendToEveryone');

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY);

            assert(getSocketRoomStub.called, 'did not call socketHandlerService.getSocketRoom on disconnecting');
            assert(getRoomStub.called, 'did not call socketHandlerService.roomService.getRoom on disconnecting');
            assert(removeRoomSpy.called, 'did not call roomMock.getPlayer on disconnecting with room.length <= 1');
            assert(sendEveryoneStub.notCalled, 'called sendToEveryoneInRoom on disconnecting with room.length <= 1');
            assert(sendToEveryoneSpy.called, 'did not call sendToEveryone on disconnecting');
            done();
        });
        it('should disconnect after 5 second if the room.length is > 1', (done) => {
            roomMock.players = [firstPlayer, secondPlayer];
            const removeRoomSpy = sinon.spy(socketHandlerService.roomService, 'removeRoom');
            const sendToEveryoneSpy = sinon.spy(socketHandlerService, 'sendToEveryone');
            const socketEmitRoomSpy = sinon.spy(socketHandlerService, 'socketEmitRoom');

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY);

            assert(getSocketRoomStub.called, 'did not call socketHandlerService.getSocketRoom on disconnecting');
            assert(getRoomStub.called, 'did not call socketHandlerService.roomService.getRoom on disconnecting');
            assert(removeRoomSpy.notCalled, 'called roomMock.getPlayer on disconnecting with room.length > 1');
            assert(getPlayerStub.called, 'did not call getPlayer on disconnecting with room.length > 1');
            assert(socketEmitRoomSpy.called, 'did not call socketEmitRoom on disconnecting with room.length > 1');
            assert(sendToEveryoneSpy.called, 'did not call sendToEveryone on disconnecting');
            done();
        });
        it('should set surrender attribute if we disconnect in a solo mode', (done) => {
            roomMock.players = [firstPlayer, secondPlayer as VirtualPlayer];
            roomMock.bot = secondPlayer as VirtualPlayer;
            const clock = sinon.useFakeTimers();
            socketMock.id = firstPlayer.socketId;
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY);
            assert(roomMock.roomInfo.surrender === 'Mode solo abandonné', 'did not set up surrender attribute');
            done();
        });
        it('should not do anything if the socket disconnecting has no room', (done) => {
            getRoomStub.returns(undefined);
            const sendToEveryoneSpy = sinon.spy(socketHandlerService, 'sendToEveryone');

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(sendToEveryoneSpy.notCalled, 'called sendToEveryone on disconnecting with no rooms');
            done();
        });
    });

    describe('reconnection tests', () => {
        it('should set the player id to the new socket id on reconnect', (done) => {
            const previousSocketId = firstPlayer.socketId;
            socketMock.id = 'newID';
            socketHandlerService.handleReconnect(socketMock, playerData);
            assert(getRoomStub.calledWith(playerData.roomName), 'did not call getRoom with correct args');
            assert(getPlayerStub.calledWith(playerData.socketId), 'did not call room.getPlayer');
            expect(firstPlayer.socketId).not.to.equal(previousSocketId);
            done();
        });
    });
});
