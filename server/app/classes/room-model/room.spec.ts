/* eslint-disable max-lines */
/* eslint-disable dot-notation */ // we want to set private attribute to tests the class
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COUNT_PLAYER_TURN } from '@app/constants/constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Room } from './room';

describe('room tests', () => {
    let room: Room;
    let socketIdMock: string;
    let socketIdMock2: string;
    let playerMock: Player;
    let playerMock2: Player;
    let inexistentPlayer: Player;
    let letterBankMock: LetterBank;

    beforeEach(() => {
        room = new Room();
        socketIdMock = '123';
        socketIdMock2 = '456';
        playerMock = new Player(socketIdMock, 'pseudo', false);
        playerMock.isItsTurn = false;
        playerMock2 = new Player(socketIdMock2, 'pseudo2', false);
        playerMock2.isItsTurn = false;
        inexistentPlayer = new Player('H45SHID', 'inexistantPlayer', false);
        letterBankMock = new LetterBank();

        sinon.stub(room['gameManager'], 'managerLetterBank').callsFake(() => {
            return letterBankMock;
        });

        room['gameManager']['letterBank'] = letterBankMock;
    });

    describe('addPlayer tests', () => {
        it('should add a player correctly to room.Players on addPlayer', () => {
            const spy = sinon.spy(room, 'fillPlayerRack');
            const nPlayers = room.players.length;
            room.addPlayer(new Player(socketIdMock, 'playerName', false));
            expect(room.players.length).to.equal(nPlayers + 1);
            assert(spy.called, 'did not call fillPlayerRack on addPlayer');
            expect(typeof room.players[0]).to.equal('object');
        });
        it('getPlayerName should return the right player name', () => {
            room.players[0] = new Player('testSocketId', 'Jonas', false);
            expect(room.getPlayerName('testSocketId')).to.equals(room.players[0].pseudo);
        });
        it('should not add a player if the array is higher than the max amount of players', () => {
            room.roomInfo.maxPlayers = 2;
            room.addPlayer(new Player(socketIdMock, 'firstPlayer', false));
            room.addPlayer(new Player(socketIdMock, 'secondPlayerName', false));

            const nPlayers = room.players.length;
            room.addPlayer(new Player(socketIdMock, 'thirdPlayerName', false));
            expect(room.players.length).to.equal(nPlayers);
        });
    });

    it('should call gameManager.givePlayerGoals on givesPlayerGoals', () => {
        const givePlayerGoalsSpy = sinon.spy(room['gameManager'], 'givePlayerGoals');
        room.givesPlayerGoals();
        assert(givePlayerGoalsSpy.calledWith(room.players), 'did not call gameManager.givePlayerGoals on givesPlayerGoals');
    });

    describe('fillPlayerRack tests', () => {
        it('should call the correct methods on fillPlayerRack', () => {
            room.players = [playerMock];
            const insertLetterSpy = sinon.spy(playerMock.rack, 'insertLetters');
            const getSpaceLeftSpy = sinon.spy(playerMock.rack, 'getSpaceLeft');
            room.fillPlayerRack(playerMock);
            assert(insertLetterSpy.called, 'did not call insertLetterSpy on fillPlayerRack');
            assert(getSpaceLeftSpy.called, 'did not call getSpaceLeftSpy on fillPlayerRack');
        });
    });

    describe('Remove player tests', () => {
        it('should reduce the players array', () => {
            room.players = [playerMock];
            const nPlayers = room.players.length;
            room.removePlayer(playerMock);
            expect(room.players.length).to.equal(nPlayers - 1);
        });
        it('should not reduce the players array if the player is not inside it', () => {
            room.players = [playerMock];
            const nPlayers = room.players.length;
            room.removePlayer(inexistentPlayer);
            expect(room.players.length).to.equal(nPlayers);
        });
    });

    describe('getPlayer tests', () => {
        it('should return a player with a matching socket ID', () => {
            room.players = [playerMock];
            const player = room.getPlayer(socketIdMock);
            expect(player).to.equal(playerMock);
        });
        it('should return undefined if the player does not exist', () => {
            room.players = [playerMock];
            const player = room.getPlayer('invalid ID');
            expect(player).to.equal(undefined);
        });
    });

    describe('getPlayerName tests', () => {
        it('should return the player pseudo with a matching socket ID', () => {
            const spy = sinon.spy(room, 'getPlayer');
            room.players = [playerMock];
            const player = room.getPlayer(socketIdMock);
            expect(player?.pseudo).to.equal(playerMock.pseudo);
            assert(spy.called, 'did not call getPlayer on getPlayerName');
        });
        it('should return undefined if the player does not exist', () => {
            room.players = [playerMock];
            const player = room.getPlayer('invalid ID');
            expect(player?.pseudo).to.equal(undefined);
        });
    });

    describe('choseRandomTurn tests', () => {
        it('should set one player isItsTurn to true if both players isItsTurn are false', () => {
            room.players = [playerMock, playerMock2];
            room.choseRandomTurn();
            let isItsTurnCount = 0;
            for (const player of room.players) {
                if (!player.isItsTurn) {
                    continue;
                }
                isItsTurnCount++;
            }
            expect(isItsTurnCount).to.equal(1);
        });
        it('should set one player isItsTurn to false if both players isItsTurn are true', () => {
            playerMock.isItsTurn = true;
            playerMock2.isItsTurn = true;
            room.players = [playerMock, playerMock2];
            room.choseRandomTurn();
            let isItsTurnCount = 0;
            for (const player of room.players) {
                if (!player.isItsTurn) {
                    continue;
                }
                isItsTurnCount++;
            }
            expect(isItsTurnCount).to.equal(1);
        });
        it('should not set any turn if there are not 2 players in the room', () => {
            room.players = [playerMock];
            room.choseRandomTurn();
            let isItsTurnCount = 0;
            for (const player of room.players) {
                if (!player.isItsTurn) {
                    continue;
                }
                isItsTurnCount++;
            }
            expect(isItsTurnCount).to.equal(0);
        });
    });

    describe('changePlayerTurn tests', () => {
        it('should change turn if there are 2 players in the room', () => {
            const previousTurn = playerMock.isItsTurn;
            playerMock2.isItsTurn = true;
            const previousTurn2 = playerMock2.isItsTurn;
            room.players = [playerMock, playerMock2];
            const expectedResult = room.canChangePlayerTurn();
            room.changePlayerTurn();
            expect(expectedResult).to.equal(true);
            expect(playerMock.isItsTurn).to.equal(!previousTurn);
            expect(playerMock2.isItsTurn).to.equal(!previousTurn2);
        });
        it('should not change turn if there are not 2 players in the room', () => {
            const previousTurn = playerMock.isItsTurn;
            room.players = [playerMock];
            const spy = sinon.spy(room['gameManager'], 'verifyBothPlayersExist');
            const expectedResult = room.canChangePlayerTurn();
            room.changePlayerTurn();
            expect(expectedResult).to.equal(false);
            expect(playerMock.isItsTurn).to.equal(previousTurn);
            assert(spy.called, 'did not call verifyBothPlayers on changePlayerTurn with player != 2');
        });
        it('should call chooseRandomTurn if both player isItsTurn are equal', () => {
            room.players = [playerMock, playerMock2];
            const spy = sinon.spy(room['gameManager'], 'choseRandomTurn');
            const expectedResult = room.canChangePlayerTurn();
            room.changePlayerTurn();
            expect(expectedResult).to.equal(true);
            assert(spy.called, 'did not call chooseRandomTurn when both players isItsTurn are equals');
        });
        it('should return false if the turnPassedCounter is >= COUNT_PLAYER_TURN', () => {
            room['gameManager'].turnPassedCounter = COUNT_PLAYER_TURN;
            expect(room.canChangePlayerTurn()).to.equal(false);
        });
    });

    describe('getCurrentPlayerTurn', () => {
        it('should return the player that has isItsTurn true', () => {
            playerMock2.isItsTurn = true;
            room.players = [playerMock, playerMock2];
            const result = room.getCurrentPlayerTurn();
            expect(result).to.equal(playerMock2);
        });
        it('should return undefined if there are not 2 players', () => {
            playerMock.isItsTurn = true;
            room.players = [playerMock];
            const spy = sinon.spy(room['gameManager'], 'verifyBothPlayersExist');
            const result = room.getCurrentPlayerTurn();
            assert(spy.called, 'did not call verifyBothPlayers on getCurrentPlayer with player != 2');
            expect(result).to.equal(undefined);
        });
    });

    describe('verifyBothPlayersExist tests', () => {
        it('should return true if there are only 2 players in the room', () => {
            room.players = [playerMock, playerMock2];
            const result = room.verifyBothPlayersExist();
            expect(result).to.equal(true);
        });
        it('should return false if players.length < 2 ', () => {
            room.players = [playerMock];
            const result = room.verifyBothPlayersExist();
            expect(result).to.equal(false);
        });
        it('should return false if players.length > 2 ', () => {
            room.players = [playerMock, playerMock2, playerMock];
            const result = room.verifyBothPlayersExist();
            expect(result).to.equal(false);
        });
    });

    it('should set all the players isItsTurn to false on setPlayersTurnToFalse', () => {
        playerMock.isItsTurn = true;
        playerMock2.isItsTurn = true;
        room.players = [playerMock, playerMock2];
        room.setPlayersTurnToFalse();
        expect(playerMock.isItsTurn).to.equal(false);
        expect(playerMock2.isItsTurn).to.equal(false);
    });

    describe('isGameFinished tests', () => {
        let letterBankStub: sinon.SinonStub;
        beforeEach(() => {
            letterBankStub = sinon.stub(letterBankMock, 'getLettersCount').callsFake(() => {
                return 1;
            });
            room.players = [playerMock];
        });
        it('should return true if the rack and the reserve is empty', () => {
            letterBankStub.callsFake(() => {
                return 0;
            });
            expect(room.isGameFinished()).to.equal(true);
            assert(letterBankStub.called, 'did not call getLettersCount');
        });
        it('should return false if the bank is not empty', () => {
            expect(room.isGameFinished()).to.equal(false);
            assert(letterBankStub.called, 'did not call getLettersCount');
        });
        it('should return false if there is not an empty rack even if the bank is empty', () => {
            letterBankStub.callsFake(() => {
                return 0;
            });
            sinon.stub(playerMock.rack, 'isEmpty').callsFake(() => {
                return false;
            });
            sinon.stub(playerMock2.rack, 'isEmpty').callsFake(() => {
                return false;
            });
            room.players = [playerMock, playerMock2];
            expect(room.isGameFinished()).to.equal(false);
            assert(letterBankStub.called, 'did not call getLettersCount');
        });
    });

    describe('getters tests', () => {
        it('room.isSolo should the roomInfo.isSOlo', () => {
            expect(room.isSolo).to.equal(room.roomInfo.isSolo);
        });

        it('should return all Goals on getAllGoals', () => {
            expect(room.getAllGoals()).to.equal(room['gameManager'].allGoals);
        });

        it('should return reached Goals on getReachedGoals', () => {
            expect(room.getReachedGoals()).to.equal(room['gameManager'].reachedGoals);
        });
    });

    describe('updateScoreOnPass and Place Finish tests', () => {
        let getPointsOfRackStub1: sinon.SinonStub;
        let getPointsOfRackStub2: sinon.SinonStub;
        let previousPlayer1Points: number;
        let previousPlayer2Points: number;
        const pointsOfRack1 = 10;
        const pointsOfRack2 = 20;

        beforeEach(() => {
            playerMock.points = 10;
            playerMock2.points = 20;
            previousPlayer1Points = playerMock.points;
            previousPlayer2Points = playerMock2.points;

            room.players = [playerMock, playerMock2];
            getPointsOfRackStub1 = sinon.stub(room.players[0].rack, 'getPointsOfRack').callsFake(() => {
                return pointsOfRack1;
            });
            getPointsOfRackStub2 = sinon.stub(room.players[1].rack, 'getPointsOfRack').callsFake(() => {
                return pointsOfRack2;
            });
        });

        it('should subtract the score of the rack to the score of the player on pass finish', () => {
            room.updateScoreOnPassFinish();
            expect(room.players[0].points).to.equal(previousPlayer1Points - pointsOfRack1);
            expect(room.players[1].points).to.equal(previousPlayer2Points - pointsOfRack2);
            assert(getPointsOfRackStub1.called, 'did not call getPointsOfRack of player 1');
            assert(getPointsOfRackStub2.called, 'did not call getPointsOfRack of player 2');
        });
        it('should decrease the score of the loser and increase the score of the winner on place finish', () => {
            room.updateScoresOnPlaceFinish(playerMock);
            expect(playerMock.points).to.equal(previousPlayer1Points + pointsOfRack2);
            expect(playerMock2.points).to.equal(previousPlayer2Points - pointsOfRack2);
            assert(getPointsOfRackStub1.notCalled, 'called getPointsOfRack of player 1 when unnecessary');
            assert(getPointsOfRackStub2.called, 'did not call getPointsOfRack of player 2');
        });
    });

    describe('getWinner tests', () => {
        beforeEach(() => {
            room.players = [playerMock, playerMock2];
        });

        it('should return an array with both player if it is a draw', () => {
            const winnerArray = room.getWinner();
            expect(winnerArray.length).to.equal(room.players.length);
            expect(winnerArray[0]).to.equal(playerMock);
            expect(winnerArray[1]).to.equal(playerMock2);
        });
        it('should return the player with the highest score as the winner (1)', () => {
            playerMock.points = 10;
            const winnerArray = room.getWinner();
            expect(winnerArray.length).to.equal(1);
            expect(winnerArray[0]).to.equal(playerMock);
        });
        it('should return the player with the highest score as the winner (2)', () => {
            playerMock2.points = 10;
            const winnerArray = room.getWinner();
            expect(winnerArray.length).to.equal(1);
            expect(winnerArray[0]).to.equal(playerMock2);
        });
        it('should return an empty array if the length of the room is less than 2', () => {
            room.players = [];
            expect(room.getWinner().length).to.equal(0);
        });
    });

    describe('greetings tests', () => {
        it('should return undefine if the bot does not exist', () => {
            expect(room.getBotGreeting()).to.equal(undefined);
        });

        it('should return the greeting of the bot if the bot exist', () => {
            room.bot = { greeting: BotGreeting.Generic } as VirtualPlayer;
            expect(room.getBotGreeting()).to.equal(BotGreeting.Generic);
        });
    });
});
