/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // we want to access private attribute of the class to test their function calls
import { Room } from '@app/classes/room-model/room';
import { PlayerData } from '@app/interfaces/player-data';
import { Server } from 'app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient } from 'socket.io-client';
import { Container } from 'typedi';

const RESPONSE_DELAY = 200;

describe('SocketManager service tests', () => {
    const server = Container.get(Server);

    // Accessing the (private) method that connects to the DB is necessary
    // We don't want to connect to the DB for no reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connectDBSpy = sinon.stub(server, 'connectToDatabase' as any).callsFake(() => {
        return;
    });
    server.init();
    connectDBSpy.restore();

    const socketManager = server.socketManager;

    const roomMock = new Room();
    roomMock.roomInfo.name = 'Room0';
    const urlString = 'http://localhost:3000';

    const clientSocket = ioClient(urlString);
    const clientSocket2 = ioClient(urlString);

    afterEach(() => {
        sinon.restore();
    });

    after(() => {
        clientSocket.close();
        clientSocket2.close();
        if (socketManager.sio) socketManager.sio.close();
    });

    describe('handleSockets tests', () => {
        it('should call handleGetPlayerInfo on getPlayerInfos', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleGetPlayerInfo');
            clientSocket.emit('getPlayerInfos', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleGetPlayerInfo on getPlayerInfos');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleReconnect on reconnect', (done) => {
            const stub = sinon.stub(socketManager['socketHandlerService'], 'handleReconnect');
            const playerData: PlayerData = { socketId: '1', roomName: 'room0' };
            clientSocket.emit('reconnect', playerData);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketHandlerService.handleReconnect on reconnect');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleGetRackInfo on getRackInfos', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleGetRackInfo');
            clientSocket.emit('getRackInfos', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleGetRackInfo on getRackInfos');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleConvertToRoomSoloBot on convertToRoomSoloBot', (done) => {
            const stub = sinon.stub(socketManager['socketHandlerService'], 'handleConvertToRoomSoloBot');
            clientSocket.emit('convertToRoomSoloBot', { roomName: roomMock.roomInfo.name, botName: 'bot' });
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketHandlerService.handleConvertToRoomSoloBot on convertToRoomSoloBot');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleJoinRoom on joinRoom', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleJoinRoom');
            clientSocket.emit('joinRoom', roomMock);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleJoinRoom on joinRoom');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleLeaveRoomCreator on leaveRoomCreator', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleLeaveRoomCreator');
            clientSocket.emit('leaveRoomCreator', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleLeaveRoomCreator on leaveRoomCreator');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleLeaveRoomOther on leaveRoomOther', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleLeaveRoomOther');
            clientSocket.emit('leaveRoomOther', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleLeaveRoomOther on leaveRoomOther');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleSetRoomAvailable on setRoomAvailable', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleSetRoomAvailable');
            clientSocket.emit('setRoomAvailable', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleSetRoomAvailable on setRoomAvailable');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleAskToJoin on askToJoin', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleAskToJoin');
            clientSocket.emit('askToJoin', roomMock);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleAskToJoin on askToJoin');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleAcceptPlayer on acceptPlayer', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleAcceptPlayer');
            clientSocket.emit('acceptPlayer', roomMock);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleAcceptPlayer on acceptPlayer');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleRejectPlayer on rejectPlayer', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleRejectPlayer');
            clientSocket.emit('rejectPlayer', roomMock);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleRejectPlayer on rejectPlayer');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleMessage on message', (done) => {
            const randomMessage = 'random';
            const stub = sinon.stub(socketManager['socketGameService'], 'handleMessage');
            clientSocket.emit('message', randomMessage);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleMessage on message');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleAvailableRooms on availableRooms', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleAvailableRooms');
            clientSocket.emit('availableRooms');
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleAvailableRooms on availableRooms');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleStartGame on startGame', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleStartGame');
            clientSocket.emit('startGame');
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleStartGame on startGame');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleChangeTurn on changeTurn', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleChangeTurn');
            clientSocket.emit('changeTurn', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleChangeTurn on changeTurn');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleBotPlayAction on botPlayAction', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleBotPlayAction');
            clientSocket.emit('botPlayAction');
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleBotPlayAction on availableRooms');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleJoinRoomSolo on joinRoomSolo', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleJoinRoomSolo');
            clientSocket.emit('joinRoomSolo', roomMock);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleJoinRoomSolo on joinRoomSolo');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleJoinRoomSoloBot on joinRoomSoloBot', (done) => {
            const stub = sinon.stub(socketManager['socketRoomService'], 'handleJoinRoomSoloBot');
            clientSocket.emit('joinRoomSoloBot', { roomName: roomMock.roomInfo.name, botName: 'bot' });
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketRoomService.handleJoinRoomSoloBot on joinRoomSoloBot');
                done();
            }, RESPONSE_DELAY);
        });

        it('should call handleGetAllGoals on getAllGoals', (done) => {
            const stub = sinon.stub(socketManager['socketGameService'], 'handleGetAllGoals');
            clientSocket.emit('getAllGoals', roomMock.roomInfo.name);
            setTimeout(() => {
                assert(stub.called, 'did not call socketManager.socketGameService.handleGetAllGoals on getAllGoals');
                done();
            }, RESPONSE_DELAY);
        });
    });
});
