import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from './constants';
import { SkipTurnCommand } from './skip-turn-command';

describe('SkipTurnCommand', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText = '!passer';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: SkipTurnCommand;
    let chatMessageService: ChatMessageService;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.isItsTurn = true;
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!passer';
        chatMessageService = new ChatMessageService();
        validCommand = new SkipTurnCommand(validText, testRoom, testPlayer, chatMessageService);
    });

    it('should detect an INVALID_SYNTAX error when the command is empty', () => {
        const command = new SkipTurnCommand('', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should detect WAIT_TURN_ERROR error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new SkipTurnCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(WAIT_TURN_ERROR);
    });

    it('should not detect an error when the command is valid', () => {
        testPlayer.isItsTurn = true;
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should skip the turn of the player that executed the command when the command is valid', () => {
        validCommand.execute();
        expect(testPlayer.isItsTurn).to.equals(false);
    });
    it('The message returned should contain the name of the sender when executing a sucessful command', () => {
        const report = validCommand.execute();
        expect(report.message?.includes(testPlayer.pseudo)).to.equal(true);
    });
    it('should detect a SYNTAX_ERROR_MESSAGE when the command has an extra parameter', () => {
        const command = new SkipTurnCommand('!passer nonSense', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
});
