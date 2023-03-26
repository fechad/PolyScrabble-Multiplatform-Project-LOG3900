/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods
/* eslint-disable dot-notation */ // we want to access private attribute to test them
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { assert, expect } from 'chai';
import * as http from 'http';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketHandlerService } from './socket-handler.service';

describe('SocketHandler service tests', () => {
    let getRoomStub: sinon.SinonStub;
    // let getSocketRoomStub: sinon.SinonStub;
    let getPlayerStub: sinon.SinonStub;
    const socketHandlerService = new SocketHandlerService(
        new io.Server(http.createServer(), { cors: { origin: '*', methods: ['GET', 'POST'] } }),
        new ScoresService({} as any),
        new PlayerGameHistoryService({} as any),
        new GamesHistoryService({} as any),
        new ChatMessageService(),
        new RoomService(),
        new DateService(),
    );
    const firstPlayer = new Player('socketId1', 'pseudo1', true);
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
        sinon.stub(socketHandlerService, 'getSocketRoom').returns(roomMock);
        sinon.stub(socketHandlerService.commandController, 'hasCommandSyntax').returns(true);
        sinon.stub(socketHandlerService.commandController, 'executeCommand').returns(undefined);
        sinon.stub(socketHandlerService as any, 'updateGame').callsFake(() => {});
        getPlayerStub = sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
    });

    afterEach(() => {
        sinon.restore();
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
