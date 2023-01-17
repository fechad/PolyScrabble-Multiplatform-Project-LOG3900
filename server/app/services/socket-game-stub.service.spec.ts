/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // we want to access private attribute to test them
import { CommandVerbs } from '@app/classes/command/command-verbs';
import { Player } from '@app/classes/player';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room-model/room';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COUNT_PLAYER_TURN, SYSTEM_NAME } from '@app/constants/constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { CommandResult } from '@app/interfaces/command-result';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DatabaseServiceMock } from './database.service.mock';
import { DateService } from './date.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketGameService } from './socket-game.service';

const validPlacementCommand = '!placer h8h hey';
const validSkipTurnCommand = '!passer';
const validSwitchLettersCommand = '!échanger abc';
const validLetterBankCommand = '!réserver';
const validHintCommand = '!indice';
const validHelpCommand = '!aide';

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

describe('Socket-game-stub service tests', () => {
    let sendEveryoneStub: sinon.SinonStub;
    let getRoomStub: sinon.SinonStub;
    let changePlayerTurnStub: sinon.SinonStub;
    let getCurrentPlayerStub: sinon.SinonStub;
    let getSocketRoomStub: sinon.SinonStub;
    let hasCommandSyntaxStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let getPlayerStub: sinon.SinonStub;
    let setTimerStub: sinon.SinonStub;

    const firstPlayer = new Player('socketId1', 'pseudo1', true);
    firstPlayer.rack = {
        getLetters: () => {
            return '';
        },
    } as Rack;
    const secondPlayer = new Player('socketId2', 'pseudo2', false);
    secondPlayer.rack = {
        getLetters: () => {
            return '';
        },
    } as Rack;
    const roomMock = new Room();
    roomMock.roomInfo.name = 'Room0';
    const socketMock = new SocketMock() as any;
    const roomService = new RoomService();
    const socketGameService = new SocketGameService(
        ioServerMock,
        new ScoresService(new DatabaseServiceMock() as any),
        new GamesHistoryService(new DatabaseServiceMock() as any),
        new ChatMessageService(),
        roomService,
        new DateService(),
    );

    beforeEach(() => {
        sinon.stub(socketGameService, 'socketEmit').callsFake(() => {
            return;
        });
        sendEveryoneStub = sinon.stub(socketGameService, 'sendToEveryoneInRoom').callsFake(() => {
            return;
        });
        setTimerStub = sinon.stub(socketGameService, 'setTimer').callsFake(() => {
            return;
        });
        sinon.stub(roomService, 'isRoomNameValid').returns(true);
        getRoomStub = sinon.stub(roomService, 'getRoom').returns(roomMock);
        changePlayerTurnStub = sinon.stub(roomMock, 'changePlayerTurn').callsFake(() => {
            return;
        });
        getCurrentPlayerStub = sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(firstPlayer);
        getSocketRoomStub = sinon.stub(socketGameService, 'getSocketRoom').returns(roomMock.roomInfo.name);
        hasCommandSyntaxStub = sinon.stub(socketGameService.commandController, 'hasCommandSyntax').returns(true);
        executeCommandStub = sinon.stub(socketGameService.commandController, 'executeCommand').returns(undefined);
        getPlayerStub = sinon.stub(roomMock, 'getPlayer').returns(firstPlayer);
        sinon.stub(roomMock, 'removePlayer').callsFake(() => {
            return;
        });
        sinon.stub(roomMock, 'getAllGoals').returns([]);
    });
    afterEach(() => {
        sinon.restore();
    });

    describe('startGame tests', () => {
        it('should create', () => {
            expect(roomService !== undefined).to.equal(true);
            expect(socketGameService !== undefined).to.equal(true);
            expect(firstPlayer !== undefined).to.equal(true);
            expect(secondPlayer !== undefined).to.equal(true);
        });

        it('Should call the correct methods on startGame', (done) => {
            sinon.stub(roomMock, 'hasTimer').returns(true);
            const spy1 = sinon.spy(roomMock, 'choseRandomTurn');
            roomMock.players = [firstPlayer, secondPlayer];
            socketGameService.handleStartGame(socketMock);
            assert(getSocketRoomStub.called, 'did not call getSocketRoomStub on startGame');
            assert(getRoomStub.called, 'did not call getRoomStub on startGame');
            assert(spy1.called, 'did not call room.choseRandomTurn() on startGame');
            assert(getCurrentPlayerStub.called, 'did not call room.getCurrentPlayerTurn() on startGame');
            done();
        });
        it('Should not call sendToEveryoneInRoom on startGame if there are not currentTurnPlayer', (done) => {
            getCurrentPlayerStub.restore();
            sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(undefined);

            roomMock.players = [firstPlayer, secondPlayer];
            socketGameService.handleStartGame(socketMock);
            assert(sendEveryoneStub.notCalled, 'called sendToEveryoneInRoom on startGame with no currentTurnPlayer');
            done();
        });
        it('Should not call server.setTimer if room.hasTimeOut is true', (done) => {
            roomMock['gameManager'].hasTimeout = true;
            roomMock.players = [firstPlayer, secondPlayer];
            socketGameService.handleStartGame(socketMock);
            assert(setTimerStub.notCalled, 'called server.setTimer on startGame');
            done();
        });
        it('Should call server.setTimer if room.hasTimeOut is false', (done) => {
            roomMock['gameManager'].hasTimeout = false;
            roomMock.players = [firstPlayer, secondPlayer];
            socketGameService.handleStartGame(socketMock);

            assert(setTimerStub.called, 'did not call server.setTimer on startGame');
            done();
        });
        it('Should call room.givesPlayerGoals() if room is log2990', (done) => {
            roomMock['gameManager'].hasTimeout = false;
            roomMock.roomInfo.gameType = 'log2990';
            roomMock.players = [firstPlayer, secondPlayer];
            const givePlayerGoalsStub = sinon.stub(roomMock, 'givesPlayerGoals');
            socketGameService.handleStartGame(socketMock);

            assert(givePlayerGoalsStub.called, 'did not call room.givesPlayerGoals when gameType was log2990');
            done();
        });
        it('Should not call room.givesPlayerGoals() if room is not log2990', (done) => {
            roomMock['gameManager'].hasTimeout = false;
            roomMock.roomInfo.gameType = 'classic';
            roomMock.players = [firstPlayer, secondPlayer];
            const givePlayerGoalsStub = sinon.stub(roomMock, 'givesPlayerGoals');
            socketGameService.handleStartGame(socketMock);

            assert(givePlayerGoalsStub.notCalled, 'called room.givesPlayerGoals when gameType was not log2990');
            done();
        });
        it('Should call handleBotGreeting() with correct attributes on handleStartGame', (done) => {
            roomMock['gameManager'].hasTimeout = false;
            roomMock.bot = secondPlayer as VirtualPlayer;
            roomMock.players = [firstPlayer, secondPlayer];
            const getBotGreetingStub = sinon.stub(roomMock, 'getBotGreeting').returns(BotGreeting.Generic);
            const handleGreetingStub = sinon.spy(socketGameService as any, 'handleBotGreeting');
            socketGameService.handleStartGame(socketMock);

            assert(getBotGreetingStub.called, 'did not call room.getBotGreetingStub on handleStartGame');
            assert(
                handleGreetingStub.calledWith(roomMock.bot.pseudo, BotGreeting.Generic, roomMock.roomInfo.name),
                'did not call room.handleGreeting on handleStartGame',
            );
            done();
        });
        it('should call the correct methods on updatePlayerView', (done) => {
            socketGameService.handleGetPlayerInfo(socketMock, roomMock.roomInfo.name);
            assert(getRoomStub.called, 'did not call roomMock.resetModel');
            assert(getPlayerStub.called, 'did not call roomMock.resetModel');
            assert(getCurrentPlayerStub.called, 'did not call roomMock.resetModel');
            done();
        });
    });

    describe('message tests', () => {
        it('should call the correctMethod to verify that a message is a command', (done) => {
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(getRoomStub.called, 'did not call roomService.getRoom');
            assert(getSocketRoomStub.called, 'did not call socketGameService.getSocketRoom');
            assert(hasCommandSyntaxStub.called, 'did not call commandController.hasCommandSyntax() on message');
            done();
        });
        it('should not call executeCommand if the message is not a command', (done) => {
            hasCommandSyntaxStub.callsFake(() => {
                return false;
            });
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(executeCommandStub.notCalled, 'called socketGameService.commandController.executeCommand when it was not');
            done();
        });
        it('should call the correct methods if a message is a command', (done) => {
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(getPlayerStub.called, 'did not call roomMock.getPlayer to know the sender of the command');
            assert(executeCommandStub.called, 'did not call socketGameService.commandController.executeCommand');
            done();
        });
        it('should call handleGamePassFinish if the room.turnPassedCounter >= COUNT_PLAYER_TURN', (done) => {
            const spy = sinon.stub(socketGameService as any, 'handleGamePassFinish');
            roomMock['gameManager'].turnPassedCounter = COUNT_PLAYER_TURN;
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(spy.called, 'did not call handleGamePass finish when turnPassedCounter >= COUNT_PLAYER_TURN');
            done();
        });
        it('should emit playerTurnChanged if the room.turnPassedCounter < COUNT_PLAYER_TURN', (done) => {
            roomMock['gameManager'].turnPassedCounter = COUNT_PLAYER_TURN - 1;
            const spy = sinon.spy(roomMock, 'isGameFinished');
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(sendEveryoneStub.called, 'Did not emit playerTurn changed when turnPassedCounter < COUNT_PLAYER_TURN');
            assert(getCurrentPlayerStub.called, 'Did not call room.getCurrentPlayerTurn to verify that the player exist');
            assert(spy.called, 'Did not call room.isGameFinished to verify if it should finish the game');
            done();
        });
        it('should handle handleGamePlaceFinish if the room.isGameFinished is true', (done) => {
            roomMock['gameManager'].turnPassedCounter = COUNT_PLAYER_TURN - 1;
            const spy1 = sinon.stub(roomMock, 'isGameFinished').callsFake(() => {
                return true;
            });
            const spy2 = sinon.stub(socketGameService as any, 'handleGamePlaceFinish');
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(spy1.called, 'did not call room.isGameFinished to verify if it should finish the game');
            assert(spy2.called, 'Did not call handleGamePlaceFinish when isGameFinished === true');
            done();
        });

        it('should not call handleGamePlaceFinish when room.isGameFinished is true if the chatMessageService isError is true', (done) => {
            roomMock['gameManager'].turnPassedCounter = COUNT_PLAYER_TURN - 1;
            sinon.stub(socketGameService.chatMessageService, 'restore');
            socketGameService.chatMessageService.isError = true;
            const spy1 = sinon.stub(roomMock, 'isGameFinished').callsFake(() => {
                return true;
            });
            socketGameService.handleMessage(socketMock, 'theMessage');
            assert(spy1.notCalled, 'Called room.isGameFinished when chatMessageService.isError === true');
            done();
        });

        it('should call the correct method with the right arguments on successful placement command', (done) => {
            const mock: CommandResult = { commandType: 'placer', commandData: {} };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validPlacementCommand);

            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            assert(sendEveryoneStub.calledWith(roomMock.roomInfo.name, 'drawBoard', mock.commandData), 'drawBoard event not sent');
            assert(sendEveryoneStub.calledWith(roomMock.roomInfo.name, 'updatePlayerScore', firstPlayer), 'updatePlayerScore event not sent');
            assert(sendEveryoneStub.calledWith(firstPlayer.socketId, 'drawRack', firstPlayer.rack.getLetters()), 'drawRack event not sent');
            assert(
                sendEveryoneStub.calledWith(roomMock.roomInfo.name, 'lettersBankCountUpdated', roomMock.letterBank.getLettersCount()),
                'lettersBankCountUpdated event not sent',
            );
            done();
        });
        it('should send a message to the sender when executing letter bank command command', (done) => {
            const mock: CommandResult = { commandType: CommandVerbs.BANK, messageToSender: 'heyo' };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validLetterBankCommand);
            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            done();
        });
        it('should send the events "playerTurnCHanged"to the client when receiving a successful skip turn command', (done) => {
            const mock: CommandResult = { commandType: 'passer' };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validSkipTurnCommand);

            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            assert(sendEveryoneStub.calledWith(roomMock.roomInfo.name, 'playerTurnChanged', firstPlayer.pseudo), 'playerTurnChanged event not sent');
            done();
        });
        it('should send the events "drawRack" and "message" to the client when receiving a successful switch letters command', (done) => {
            const mock: CommandResult = { commandType: 'échanger', messageToSender: 'good', messageToOthers: 'very good' };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validSwitchLettersCommand);
            const message = { text: mock.messageToSender, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM };
            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            assert(sendEveryoneStub.calledWith(firstPlayer.socketId, 'drawRack', firstPlayer.rack.getLetters()), 'drawRack event not sent');
            assert(sendEveryoneStub.calledWith(firstPlayer.socketId, 'message', message), 'message event not sent');
            done();
        });
        it('should send a message to the sender when executing hint command', (done) => {
            const mock: CommandResult = { commandType: CommandVerbs.HINT, messageToSender: 'heyo' };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validHintCommand);
            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            done();
        });
        it('should send a message to the sender when executing help command', (done) => {
            const mock: CommandResult = { commandType: CommandVerbs.HELP, messageToSender: 'heyo' };
            executeCommandStub.callsFake(() => {
                return mock;
            });
            socketGameService.handleMessage(socketMock, validHelpCommand);
            assert(sendEveryoneStub.called, 'The method sendToEveryoneInRoom was not called');
            done();
        });
    });

    describe('changeTurn tests', () => {
        it('should call socketGameService.changeTurn on changeTurn', (done) => {
            roomMock['gameManager'].turnPassedCounter = 0;
            const spy = sinon.spy(socketGameService, 'changeTurn');
            socketGameService.handleChangeTurn(socketMock, roomMock.roomInfo.name);
            assert(getRoomStub.called, 'did not call socketGameService.roomService.getRoom on changeTurn');
            assert(spy.called, 'did not call commandController.changeTurn() on changeTurn');
            done();
        });
        it('should call the correct methods on changeTurn', (done) => {
            const canChangePlayerTurnStub = sinon.stub(roomMock, 'canChangePlayerTurn').returns(true);
            socketGameService.changeTurn(roomMock);
            expect(canChangePlayerTurnStub.called, 'did not call canChangePlayerStub on changeTurn');
            assert(changePlayerTurnStub.called, 'did not call room.changePlayerTurn on changeTurn');
            assert(getCurrentPlayerStub.called, 'did not call room.getCurrentPlayerTurn on changeTurn');
            assert(sendEveryoneStub.called, 'did not emit the playerTurn changed signal');
            done();
        });
        it('should set the room.elapsedTime to 0 and increment the turnPassedCounter on changeTurn', (done) => {
            roomMock.elapsedTime = 20;
            const previousCounter = (roomMock['gameManager'].turnPassedCounter = 0);
            const canChangePlayerTurnStub = sinon.stub(roomMock, 'canChangePlayerTurn').returns(true);
            socketGameService.changeTurn(roomMock);
            expect(canChangePlayerTurnStub.called, 'did not call canChangePlayerStub on changeTurn');
            expect(roomMock.elapsedTime).to.equal(0);
            expect(roomMock['gameManager'].turnPassedCounter).to.equal(previousCounter + 1);
            done();
        });
    });
});
