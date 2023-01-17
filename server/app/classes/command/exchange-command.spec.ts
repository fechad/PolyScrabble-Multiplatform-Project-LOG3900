import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { ALMOST_EMPTY_BANK_ERROR, MINIMUM_BANK_LETTERS_FOR_EXCHANGE, SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from './constants';
import { ExchangeLettersCommand } from './exchange-command';

describe('ExchangeLetters command', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText = '!échanger hgfr';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: ExchangeLettersCommand;
    let chatMessageService: ChatMessageService;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.rack.setLetters('bonjour');
        testPlayer.isItsTurn = true;
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!échanger bon';
        chatMessageService = new ChatMessageService();
        validCommand = new ExchangeLettersCommand(validText, testRoom, testPlayer, chatMessageService);
    });

    it('should detect a SYNTAX_ERROR when the command is empty', () => {
        const invalidCommand = new ExchangeLettersCommand('', testRoom, testPlayer, chatMessageService);
        invalidCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });

    it('should not detect an error when the command is valid', () => {
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should detect an SYNTAX_ERROR_MESSAGE when the length of the command is missing the letters to exchange', () => {
        const invalidCommand = new ExchangeLettersCommand('!échanger', testRoom, testPlayer, chatMessageService);
        invalidCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should detect a SYNTAX_ERROR_MESSAGE when the command has an extra parameter', () => {
        const invalidCommand = new ExchangeLettersCommand('!échanger bon jour', testRoom, testPlayer, chatMessageService);
        invalidCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });

    it('should detect WAIT_TURN_ERROR error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(WAIT_TURN_ERROR);
    });
    it('should detect ALMOST_EMPTY_BANK_ERROR error when the bank does not have enough letters for exchange', () => {
        sinon.stub(testRoom.letterBank, 'getLettersCount').returns(MINIMUM_BANK_LETTERS_FOR_EXCHANGE - 1);
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(ALMOST_EMPTY_BANK_ERROR);
    });

    it('The message returned to the other players when executing a successful command should contain the name of the sender ', () => {
        const report = validCommand.execute();
        expect(report.messageToOthers?.includes(testPlayer.pseudo)).to.equal(true);
    });
    it('should detect the right error when at least one letter is not in the player"s rack', () => {
        testPlayer.rack.setLetters('rieneva');
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql('Erreur une ou plusieurs lettres ne sont pas dans le chevalet');
    });
});
