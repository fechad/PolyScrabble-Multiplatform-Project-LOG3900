/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods
/* eslint-disable dot-notation */ // we want to access private attribute to test them
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DISCONNECT_DELAY, SYSTEM_NAME } from '@app/constants/constants';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { DEFAULT_ENGLISH_QUOTES, DEFAULT_FRENCH_QUOTES } from '@app/enums/themed-quotes/quotes';
import { ChatMessage } from '@app/interfaces/chat-message';
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
const RESPONSE_DELAY = 200;
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
    const secondPlayer = new Player('socketId2', 'pseudo2', false);
    const virtualPlayer = new VirtualPlayer(
        'Botnet',
        false,
        { askNode: (row: string, column: number) => {}, askNodeByIndex: (index: number) => {} } as any,
        {} as any,
        'débutant',
    );
    virtualPlayer.setQuotes(DEFAULT_FRENCH_QUOTES, DEFAULT_ENGLISH_QUOTES);
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

    describe('disconnecting tests', () => {
        beforeEach(() => {
            roomMock.roomInfo.isSolo = false;
            roomMock.players = [firstPlayer, secondPlayer];
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

        it('should remove the room if the only player left', (done) => {
            roomMock.players = [firstPlayer];

            socketHandlerService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketHandlerService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            expect(socketHandlerService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should remove the room if the player left on solo room', (done) => {
            roomMock.roomInfo.isSolo = true;
            roomMock.players = [firstPlayer];
            socketHandlerService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketHandlerService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            expect(socketHandlerService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should remove the player from the room', (done) => {
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(firstPlayer);
            const removePlayerSpy = sinon.spy(roomMock, 'removePlayer');

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(removePlayerSpy.calledWith(firstPlayer), 'did not call removePlayer with good params on disconnecting');
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(undefined);
            done();
        });

        it('should remove the room if the only real player left on multi room', (done) => {
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(firstPlayer);
            expect(roomMock.hasARealPlayerLeft()).equal(true);

            roomMock.players = [firstPlayer, virtualPlayer];
            const removePlayerSpy = sinon.spy(roomMock, 'removePlayer');

            socketHandlerService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketHandlerService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(removePlayerSpy.calledWith(firstPlayer), 'did not call removePlayer with good params on disconnecting');
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(undefined);
            expect(roomMock.hasARealPlayerLeft()).equal(false);
            expect(socketHandlerService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should swap the player for a bot when real player left on multi room', (done) => {
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(firstPlayer);
            const virtualPlayerSpy = sinon.spy(roomMock, 'createVirtualPlayer');

            const previousRoomMockPlayersLength = roomMock.players.length;

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(virtualPlayerSpy.called, 'did not call createPlayerVirtual when real player left on multi room');
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(undefined);
            expect(roomMock.players.length).equal(previousRoomMockPlayersLength);
            done();
        });

        it('should set the bot correctly when a real player left on multi room', (done) => {
            const playerPoints = 10;
            firstPlayer.points = playerPoints;
            const createVirtualPlayerStub = sinon.stub(roomMock, 'createVirtualPlayer').returns(virtualPlayer);
            const botReplaceRackSpy = sinon.spy(virtualPlayer, 'replaceRack');

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(createVirtualPlayerStub.called, 'did not call createPlayerVirtual when real player left on multi room');
            assert(botReplaceRackSpy.called, 'did not call replaceRack when real player left on multi room');
            expect(virtualPlayer.points).equal(playerPoints);
            done();
        });

        it('should call the correct methods when a real player leave on multi room', (done) => {
            sinon.stub(roomMock, 'createVirtualPlayer').returns(virtualPlayer);
            const sendToEveryoneSpy = sinon.spy(socketHandlerService, 'sendToEveryoneInRoom');
            const socketEmitRoomSpy = sinon.spy(socketHandlerService, 'socketEmitRoom');

            const systemAlert: ChatMessage = {
                sender: SYSTEM_NAME,
                color: MessageSenderColors.SYSTEM,
                text: 'Votre adversaire a quitté la partie \n Il a été remplacé par le jouer virtuel ' + virtualPlayer.pseudo,
            };

            const clock = sinon.useFakeTimers();
            socketHandlerService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(
                sendToEveryoneSpy.calledWith(roomMock.roomInfo.name, SocketEvent.PlayerTurnChanged, roomMock.getCurrentPlayerTurn()?.pseudo),
                'did not send playerTurnChanged',
            );
            assert(
                socketEmitRoomSpy.calledWith(socketMock, roomMock.roomInfo.name, SocketEvent.PlayerLeft, firstPlayer),
                'did not call socketEmitRoom with good param when player left',
            );
            assert(sendToEveryoneSpy.calledWith(roomMock.roomInfo.name, SocketEvent.BotJoinedRoom, roomMock.players), 'did not send BotJoinedRoom');
            assert(sendToEveryoneSpy.calledWith(roomMock.roomInfo.name, SocketEvent.Message, systemAlert), 'did not send Message with systemAlert');

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
