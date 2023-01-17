import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { SYNTAX_ERROR_MESSAGE } from './constants';
import { HelpCommand } from './help-command';

describe('HelpCommand', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText = '!aide';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: HelpCommand;
    let chatMessageService: ChatMessageService;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.isItsTurn = true;
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!aide';
        chatMessageService = new ChatMessageService();
        validCommand = new HelpCommand(validText, testRoom, testPlayer, chatMessageService);
    });

    it('should detect an INVALID_SYNTAX error when the command is empty', () => {
        const command = new HelpCommand('', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should not detect WAIT_TURN_ERROR error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new HelpCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should not detect an error when the command is valid', () => {
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should not skip the turn of the player that executed the command when the command is valid', () => {
        validCommand.execute();
        expect(testPlayer.isItsTurn).to.equals(true);
    });
    it('should detect a SYNTAX_ERROR_MESSAGE when the command has an extra parameter', () => {
        const command = new HelpCommand('!passer nonSense', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
});
