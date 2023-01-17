/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // we need to access some private attributes for the tests
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { Score } from '@app/classes/score';
import { SocketMock } from '@app/classes/socket-mock';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { CommandResult } from '@app/interfaces/command-result';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DatabaseServiceMock } from './database.service.mock';
import { DateService } from './date.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketGameService } from './socket-game.service';

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

describe('LeaderBoard', () => {
    const fakeDate = '2021:08:21T00:00:00';

    let getRoomStub: sinon.SinonStub;
    let updateBestScoreStub: sinon.SinonStub;

    const roomService = new RoomService();

    const scoreService = new ScoresService(new DatabaseServiceMock() as any);

    const socketGameService = new SocketGameService(
        ioServerMock,
        scoreService,
        new GamesHistoryService(new DatabaseServiceMock() as any),
        new ChatMessageService(),
        roomService,
        new DateService(),
    );
    const fakeCommandResult: CommandResult = {
        commandType: '',
    };

    const roomMock = new Room();

    const firstPlayer = new Player('socketId1', 'pseudo1', true);
    const secondPlayer = new Player('socketId2', 'pseudo2', false);
    roomMock.roomInfo.name = 'Room0';
    roomMock['gameManager'].turnPassedCounter = 0;
    const socketMock = new SocketMock() as any;

    beforeEach(() => {
        getRoomStub = sinon.stub(socketGameService.roomService, 'getRoom').callsFake(() => {
            return roomMock;
        });
        updateBestScoreStub = sinon.stub(scoreService, 'updateBestScore').resolves();
        sinon.stub(socketGameService.commandController, 'executeCommand').returns(fakeCommandResult);
        sinon.stub(roomMock, 'isGameFinished').returns(true);
        sinon.stub(roomMock, 'getCurrentPlayerTurn').returns(secondPlayer);
        sinon.stub(roomMock, 'getPlayer').returns(secondPlayer);
        sinon.stub(socketGameService.commandController, 'hasCommandSyntax').returns(true);
        sinon.stub(socketGameService['dateService'], 'getCurrentDate').callsFake(() => fakeDate);
    });

    afterEach(() => {
        roomMock['gameManager'].turnPassedCounter = 0;
        roomMock.bot = undefined as unknown as VirtualPlayer;
        sinon.restore();
    });

    describe('updateLeaderboard tests', () => {
        it('When both players give up (they skip turn 6 times) updateLeaderboard should not be called', (done) => {
            roomMock.players = [firstPlayer, secondPlayer];
            roomMock['gameManager'].turnPassedCounter = 7;
            getRoomStub.returns(roomMock);
            socketMock.id = secondPlayer.socketId;
            socketGameService.handleMessage(socketMock, '');
            assert(updateBestScoreStub.calledTwice, 'did not call updateLeaderboard twice');
            done();
        });
        it('When the game finishes with a winner and a loser it should call updateLeaderboard twice', (done) => {
            secondPlayer.points = 5;
            firstPlayer.points = 2;
            roomMock.players = [firstPlayer, secondPlayer];
            socketMock.id = secondPlayer.socketId;
            socketGameService.handleMessage(socketMock, '');
            assert(updateBestScoreStub.calledTwice, 'did not call updateLeaderboard twice');
            done();
        });
        it('When the game ends with a draw it should call updateLeaderboard twice', (done) => {
            secondPlayer.points = 5;
            firstPlayer.points = 5;
            roomMock.players = [firstPlayer, secondPlayer];
            socketMock.id = secondPlayer.socketId;
            socketGameService.handleMessage(socketMock, '');
            assert(updateBestScoreStub.calledTwice, 'did not call updateLeaderboard twice');
            done();
        });
        it('When there is a virtual player in the room, scoreService.updateBestScore should only be called once with the real player', (done) => {
            roomMock.bot = secondPlayer as VirtualPlayer;
            roomMock.roomInfo.isSolo = true;
            firstPlayer.points = 5;
            const score: Score = {
                points: 5,
                author: firstPlayer.pseudo,
                gameType: roomMock.roomInfo.gameType,
                dictionary: roomMock.roomInfo.dictionary,
                date: fakeDate,
            };
            roomMock['gameManager'].turnPassedCounter = 0;
            roomMock.players = [firstPlayer, roomMock.bot];
            socketMock.id = secondPlayer.socketId;
            socketGameService.handleMessage(socketMock, '');
            assert(updateBestScoreStub.calledOnceWith(score), 'did not call updateLeaderboard once with the human player score');
            done();
        });
    });
});
