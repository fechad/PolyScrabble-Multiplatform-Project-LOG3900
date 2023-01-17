import { CommandVerbs } from '@app/classes/command/command-verbs';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { SYNTAX_ERROR_MESSAGE } from './constants';
import { LetterBankCommand } from './letter-bank-command';

describe('LetterBankCommand', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText = '!réserve';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: LetterBankCommand;
    let chatMessageService: ChatMessageService;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.isItsTurn = true;

        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!réserve';
        chatMessageService = new ChatMessageService();
        validCommand = new LetterBankCommand(validText, testRoom, testPlayer, chatMessageService);
        sinon.restore();
    });

    it('should detect INVALID_SYNTAX error when the command is empty', () => {
        const command = new LetterBankCommand('', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should execute the command and not detect an error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new LetterBankCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should execute the command and not detect an error when it is the player turn to play', () => {
        const command = new LetterBankCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should execute the command when it is not the player turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new LetterBankCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should not detect an error when the command is valid', () => {
        testPlayer.isItsTurn = false;
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should not skip the turn of the player that executed the command when the command is valid', () => {
        validCommand.execute();
        expect(testPlayer.isItsTurn).to.equals(true);
    });
    it('The message returned should contain the stringified content of the letter bank when executing a sucessful command', () => {
        const content = 'a : 5';
        const letterBank = testRoom.letterBank;
        const stub = sinon.stub(letterBank, 'stringifyContent').callsFake(() => {
            return content;
        });
        const message = validCommand.execute().messageToSender;
        expect(stub.called).to.be.equal(true);
        expect(message).to.equal(content);
    });
    it('should detect a SYNTAX_ERROR_MESSAGE when the command has an extra parameter', () => {
        const command = new LetterBankCommand('!réserve nonSense', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('executing a valid command should return the right command type', () => {
        const result: CommandResult = validCommand.execute();
        expect(result.commandType).to.equals(CommandVerbs.BANK);
    });
    it('should detect a SYNTAX_ERROR if the command is not preceded by a "!"', () => {
        const command = new LetterBankCommand('réserve', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('Only the sender of the command should see the execution message when executing a valid command', () => {
        const result = validCommand.execute();
        expect(result.messageToOthers).to.equal(undefined);
        expect(result.message).to.equal(undefined);
        expect(result.messageToSender).to.not.equal(undefined);
    });
});
