/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to tests private methods
/* eslint-disable dot-notation */ // we want to access private attribute to test
import { Player } from '@app/classes/player';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DISCONNECT_DELAY } from '@app/constants/constants';
import { GoalTitle } from '@app/enums/goal-titles';
import { SocketEvent } from '@app/enums/socket-event';
import { DEFAULT_ENGLISH_QUOTES, DEFAULT_FRENCH_QUOTES } from '@app/enums/themed-quotes/quotes';
import { CommandResult } from '@app/interfaces/command-result';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketGameService } from './socket-game.service';

const TIMER_DELAY = 2000;

const ioServerMock = {
    // eslint-disable-next-line no-unused-vars -- we want to mock ioServer
    to: (name?: string) => {
        return {
            // eslint-disable-next-line no-unused-vars -- we want to mock ioServer
            emit: (name2?: string, data?: unknown) => {
                return;
            },
        };
    },
} as unknown as io.Server;

describe('socketGameService service tests', () => {
    let sendEveryoneStub: sinon.SinonStub;
    let socketEmitStub: sinon.SinonStub;
    let getRoomStub: sinon.SinonStub;
    let getSocketRoomStub: sinon.SinonStub;
    let sendToEveryoneStub: sinon.SinonStub;

    const roomService = new RoomService();
    const socketGameService = new SocketGameService(
        new DiscussionChannelService(),
        ioServerMock,
        new ScoresService({} as any),
        new PlayerGameHistoryService({} as any),
        new GamesHistoryService({} as any),
        new ChatMessageService(),
        roomService,
        new DateService(),
    );
    const firstPlayer = new Player('socketId1', 'pseudo1', true);
    const roomMock = new Room();
    roomMock.roomInfo.name = 'R-0';
    roomMock.bots[0] = {
        playTurn: () => {
            return '' as any;
        },
    } as VirtualPlayer;
    const socketMock = new SocketMock() as any;

    beforeEach(() => {
        sendEveryoneStub = sinon.stub(socketGameService, 'sendToEveryoneInRoom').callsFake(() => {});
        socketEmitStub = sinon.stub(socketGameService, 'socketEmit').callsFake(() => {});
        getRoomStub = sinon.stub(roomService, 'getRoom');
        getSocketRoomStub = sinon.stub(socketGameService, 'getSocketRoom').returns(roomMock);
        sinon.stub(roomMock, 'getAllGoals').callsFake(() => {
            return [];
        });
        sendToEveryoneStub = sinon.stub(socketGameService, 'sendToEveryone').callsFake(() => {});
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleGetAllGoals  tests', () => {
        it('should create', () => {
            expect(roomService !== undefined).to.equal(true);
            expect(socketGameService !== undefined).to.equal(true);
            expect(firstPlayer !== undefined).to.equal(true);
        });

        it('should call socket sendToEveryoneInRoom on handleGetAllGoals', (done) => {
            getRoomStub.returns(roomMock);
            sinon.stub(socketGameService as any, 'isRoomValid').returns(true);
            socketGameService.handleGetAllGoals(socketMock);
            assert(sendEveryoneStub.calledOnce, 'did not call sendToEveryoneInRoom on handleGetAllGoals');
            done();
        });

        it('should not call socket sendToEveryoneInRoom on handleGetAllGoals if room is invalid', (done) => {
            getRoomStub.returns(roomMock);
            sinon.stub(socketGameService as any, 'isRoomValid').returns(false);
            socketGameService.handleGetAllGoals(socketMock);
            assert(sendEveryoneStub.notCalled, 'did not call sendToEveryoneInRoom on handleGetAllGoals');
            done();
        });
    });

    describe('handleGetRackInfo  tests', () => {
        beforeEach(() => {
            firstPlayer.rack = {
                getLetters: () => {
                    return '';
                },
            } as Rack;
        });
        it('should call socket sendToEveryoneInRoom on handleGetRackInfo', (done) => {
            getRoomStub.returns(roomMock);
            sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
            sinon.stub(roomMock, 'getPlayersRack').callsFake(() => {
                return [];
            });
            sinon.stub(socketGameService as any, 'isRoomAndPlayerValid').returns(true);
            socketGameService.handleGetRackInfo(socketMock, roomMock.roomInfo.name);
            assert(socketEmitStub.calledOnce, 'did not call sendToEveryoneInRoom on handleGetRackInfo');
            done();
        });

        it('should not call socket sendToEveryoneInRoom on handleGetRackInfo if room is invalid', (done) => {
            getRoomStub.returns(roomMock);
            sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
            sinon.stub(socketGameService as any, 'isRoomAndPlayerValid').returns(false);
            socketGameService.handleGetRackInfo(socketMock, roomMock.roomInfo.name);
            assert(socketEmitStub.notCalled, 'did not call sendToEveryoneInRoom on handleGetRackInfo');
            done();
        });
    });

    describe('setTimer tests', () => {
        let changeTurnSpy: sinon.SinonSpy;
        beforeEach(() => {
            roomMock.players = [];
            roomMock.roomInfo.timerPerTurn = '30';
            changeTurnSpy = sinon.spy(socketGameService, 'changeTurn');
        });
        afterEach(() => {
            roomMock.elapsedTime = -1;
        });
        it('should call socketGameService.changeTurn if room.elapsedTime >= room.timerPerTurn', (done) => {
            roomMock.players = [firstPlayer, firstPlayer];
            const secondPlayer = {
                ...firstPlayer,
                avatarUrl: '',
                replaceRack: () => {
                    return;
                },
                addCommand: () => {
                    return;
                },
                pseudo: '',
            };
            secondPlayer.pseudo = 'two';
            const getCurrentPlayerTurnStub = sinon.stub(roomMock, 'getCurrentPlayerTurn').callsFake(() => {
                return firstPlayer;
            });
            const findStub = sinon.stub(roomMock.players, 'find').callsFake(() => {
                return secondPlayer;
            });
            roomMock.elapsedTime = parseInt(roomMock.roomInfo.timerPerTurn, 10);
            const nTurnPassed = roomMock.turnPassedCounter;

            const clock = sinon.useFakeTimers();
            socketGameService.setTimer(socketMock, roomMock);
            clock.tick(TIMER_DELAY);
            assert(getCurrentPlayerTurnStub.called, 'did not call room.getCurrentPlayerTurn when conditions were met');
            assert(findStub.called, 'did not call room.players.find when conditions were met');
            assert(changeTurnSpy.called, 'did not call socketGameService.changeTurn when conditions were met');
            expect(roomMock.turnPassedCounter).to.equal(nTurnPassed + 1);
            done();
        });

        it('should clear the interval if room.elapsedTime has a negative value', (done) => {
            roomMock.elapsedTime = -1;
            roomMock.players = [firstPlayer];

            const clock = sinon.useFakeTimers();
            socketGameService.setTimer(socketMock, roomMock);
            clock.tick(TIMER_DELAY);
            assert(changeTurnSpy.notCalled, 'called changeTurn when the timer is supposed to be cleared');
            done();
        });

        it('should clear the interval if there are no player left in room on setTimer', (done) => {
            roomMock.elapsedTime = 10;
            roomMock.players = [];

            const clock = sinon.useFakeTimers();
            socketGameService.setTimer(socketMock, roomMock);
            clock.tick(TIMER_DELAY);
            assert(changeTurnSpy.notCalled, 'called changeTurn when the timer is supposed to be cleared');
            done();
        });
    });

    describe('communicate new achievement tests', () => {
        it('should communicate new achievement on notifyViewBasedOnCommandResult if gameType is log2990', () => {
            const reachedGoal = { title: GoalTitle.AtLeastFive, playerName: firstPlayer.pseudo, communicated: false, reward: 1 };
            roomMock.roomInfo.gameType = 'log2990';
            sinon.stub(roomMock, 'getReachedGoals').returns([reachedGoal]);
            const communicateNewAchievementsSpy = sinon.spy(socketGameService as any, 'communicateNewAchievements');
            (socketGameService as any).notifyViewBasedOnCommandResult(
                { message: 'test message', commandType: 'none' } as CommandResult,
                roomMock,
                firstPlayer,
                socketMock,
            );
            assert(
                communicateNewAchievementsSpy.calledWith(roomMock.roomInfo.name, [reachedGoal]),
                'did not call communicateNewAchievements on notifyViewBasedOnCommandResult with good arguments on log2990 gameType',
            );
            expect(reachedGoal.communicated).to.equal(true);
        });

        it('should communicate new achievement on notifyViewBasedOnCommandResult if gameType is not log2990', () => {
            const reachedGoal = { title: GoalTitle.AtLeastFive, playerName: firstPlayer.pseudo, communicated: false, reward: 1 };
            roomMock.roomInfo.gameType = 'classic';
            sinon.stub(roomMock, 'getReachedGoals').returns([reachedGoal]);
            const communicateNewAchievementsSpy = sinon.spy(socketGameService as any, 'communicateNewAchievements');
            (socketGameService as any).notifyViewBasedOnCommandResult(
                { message: 'test message', commandType: 'none' } as CommandResult,
                roomMock,
                firstPlayer,
                socketMock,
            );
            assert(
                communicateNewAchievementsSpy.called,
                'did not called communicateNewAchievements on notifyViewBasedOnCommandResult on !log2990 gameType',
            );
            expect(reachedGoal.communicated).to.equal(true);
        });
    });

    describe('Validity tests', () => {
        it('should return false if the room and the players are not valid', () => {
            expect((socketGameService as any).isRoomAndPlayerValid(socketMock, roomMock.roomInfo.name)).to.equal(false);
        });

        it('should return true if the room and the players are valid', () => {
            getRoomStub.returns(roomMock);
            sinon.stub(roomMock, 'getPlayer').callsFake(() => {
                return firstPlayer;
            });
            expect((socketGameService as any).isRoomAndPlayerValid(socketMock, roomMock.roomInfo.name)).to.equal(true);
        });

        it('should return false if the room is not valid', () => {
            getSocketRoomStub.restore();
            expect((socketGameService as any).isRoomValid(socketMock)).to.equal(false);
        });

        it('should return true if the room is valid', () => {
            getRoomStub.returns(roomMock);
            expect((socketGameService as any).isRoomValid(socketMock)).to.equal(true);
        });
    });

    it('should not update a score if the players are undefined', () => {
        roomMock.players = [undefined as unknown as Player, undefined as unknown as Player];
        (socketGameService as any).updatePlayersScore(roomMock);
        assert(sendEveryoneStub.notCalled, 'called sendToEveryoneInRoom updatePlayerScore with undefined player');
    });

    describe('disconnecting tests', () => {
        const virtualPlayer = new VirtualPlayer(
            'Botnet',
            false,
            { askNode: (row: string, column: number) => {}, askNodeByIndex: (index: number) => {} } as any,
            {} as any,
        );
        virtualPlayer.setQuotes(DEFAULT_FRENCH_QUOTES, DEFAULT_ENGLISH_QUOTES);
        const secondPlayer = new Player('socketId2', 'pseudo2', false);

        beforeEach(() => {
            getRoomStub.restore();

            roomMock.elapsedTime = 1;
            roomMock.roomInfo.isSolo = false;
            roomMock.players = [firstPlayer, secondPlayer];
            sinon.stub(socketGameService.roomService, 'isRoomNameValid').returns(true);
            sinon.stub(roomMock, 'updateScoreOnPassFinish').callsFake(() => {});
            getRoomStub = sinon.stub(socketGameService.roomService, 'getRoom').returns(roomMock);
            sinon.stub(roomMock, 'changePlayerTurn').callsFake(() => {
                return;
            });
            sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(firstPlayer);
            sinon.stub(socketGameService.commandController, 'hasCommandSyntax').returns(true);
            sinon.stub(socketGameService.commandController, 'executeCommand').returns(undefined);
            sinon.stub(socketGameService as any, 'updateGame').callsFake(() => {});
            sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
        });

        const RESPONSE_DELAY = 200;

        it('should not do anything if the socket disconnecting has no room', (done) => {
            getRoomStub.returns(undefined);

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(sendToEveryoneStub.notCalled, 'called sendToEveryone on disconnecting with no rooms');
            done();
        });

        it('should remove the room if the only player left', (done) => {
            roomMock.players = [firstPlayer];

            socketGameService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketGameService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            expect(socketGameService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should remove the room if the player left on solo room', (done) => {
            roomMock.roomInfo.isSolo = true;
            roomMock.players = [firstPlayer];
            socketGameService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketGameService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            expect(socketGameService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should remove the player from the room', (done) => {
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(firstPlayer);
            const removePlayerSpy = sinon.spy(roomMock, 'removePlayer');

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
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

            socketGameService.roomService.roomsAvailable = [roomMock];
            const previousRoomServiceLength = socketGameService.roomService.roomsAvailable.length;

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(removePlayerSpy.calledWith(firstPlayer), 'did not call removePlayer with good params on disconnecting');
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(undefined);
            expect(roomMock.hasARealPlayerLeft()).equal(false);
            expect(socketGameService.roomService.roomsAvailable.length).equal(previousRoomServiceLength - 1);
            done();
        });

        it('should swap the player for a bot when real player left on multi room', (done) => {
            expect(roomMock.getPlayerByName(firstPlayer.pseudo)).equal(firstPlayer);
            const virtualPlayerSpy = sinon.spy(roomMock, 'createVirtualPlayer');

            const previousRoomMockPlayersLength = roomMock.players.length;

            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
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
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(createVirtualPlayerStub.called, 'did not call createPlayerVirtual when real player left on multi room');
            assert(botReplaceRackSpy.called, 'did not call replaceRack when real player left on multi room');
            expect(virtualPlayer.points).equal(playerPoints);
            done();
        });

        it('should call the correct methods when a real player leave on multi room', (done) => {
            sinon.stub(roomMock, 'createVirtualPlayer').returns(virtualPlayer);
            const socketEmitRoomSpy = sinon.spy(socketGameService, 'socketEmitRoom');
            const clock = sinon.useFakeTimers();
            socketGameService.handleDisconnecting(socketMock);
            clock.tick(DISCONNECT_DELAY + RESPONSE_DELAY * 3);

            assert(
                sendEveryoneStub.calledWith(roomMock.roomInfo.name, SocketEvent.PlayerTurnChanged, roomMock.getCurrentPlayerTurn()?.pseudo),
                'did not send playerTurnChanged',
            );
            assert(
                socketEmitRoomSpy.calledWith(socketMock, roomMock.roomInfo.name, SocketEvent.PlayerLeft, firstPlayer),
                'did not call socketEmitRoom with good param when player left',
            );
            // assert(sendEveryoneStub.calledWith(roomMock.roomInfo.name, SocketEvent.BotJoinedRoom, roomMock.players), 'did not send BotJoinedRoom');
            done();
        });
    });
});
