import { Command } from '@app/classes/command/command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Command', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    let command = '!passer';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: Command;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.rack.setLetters('bonjour');
        command = '!placer h7h bonjour';
        validCommand = new Command(command, testRoom, testPlayer);
    });

    it('should call the method execute correcly', () => {
        expect(validCommand.execute().commandType).to.equal('command');
    });

    it('should return true if it is the player s turn', () => {
        testPlayer.isItsTurn = true;
        const prototype = Object.getPrototypeOf(validCommand);
        prototype.command = validCommand;
        prototype.room = testRoom;
        prototype.commandSender = testPlayer;
        expect(prototype.isPlayerTurn()).to.equal(true);
    });
    it('should return false if it is not the player s turn', () => {
        testPlayer.isItsTurn = false;
        const prototype = Object.getPrototypeOf(validCommand);
        prototype.command = validCommand;
        prototype.room = testRoom;
        prototype.commandSender = testPlayer;
        expect(prototype.isPlayerTurn()).to.equal(false);
    });
});
