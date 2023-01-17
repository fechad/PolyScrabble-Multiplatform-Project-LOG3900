import { HintCommand } from '@app/classes/command/hint-command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { PlacementDirections } from '@app/enums/placement-directions';
import { CommandResult } from '@app/interfaces/command-result';
import { UserPlacement } from '@app/interfaces/user-placement';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { CommandVerbs } from './command-verbs';
import { SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from './constants';

describe('HintCommand', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText: string;
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: HintCommand;
    let chatMessageService: ChatMessageService;

    const userPlacement1: UserPlacement = {
        row: 'a',
        col: 2,
        direction: PlacementDirections.Horizontal,
        oldWord: 'a',
        newWord: 'b',
        letters: 'test',
        points: 10,
    };
    const finderMock = {
        getPlacement: () => {
            return [userPlacement1];
        },
    } as unknown as PlacementFinder;
    before(() => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.isItsTurn = true;
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!indice';
        chatMessageService = new ChatMessageService();
        validCommand = new HintCommand(validText, testRoom, testPlayer, finderMock, chatMessageService);
    });
    beforeEach(() => {
        chatMessageService.restore();
    });
    it('should detect INVALID_SYNTAX error when the command is empty', () => {
        const command = new HintCommand('', testRoom, testPlayer, finderMock, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should not execute the command and detect an error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new HintCommand(validText, testRoom, testPlayer, finderMock, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(WAIT_TURN_ERROR);
    });
    it('should execute the command and not detect an error when it is the player turn to play', () => {
        testPlayer.isItsTurn = true;
        const command = new HintCommand(validText, testRoom, testPlayer, finderMock, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should not detect an error when the command is valid', () => {
        testPlayer.isItsTurn = true;
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('should detect a SYNTAX_ERROR_MESSAGE when the command has an extra parameter', () => {
        const command = new HintCommand('!indice nonSense', testRoom, testPlayer, finderMock, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('executing a valid command should return the right command type', () => {
        const result: CommandResult = validCommand.execute();
        expect(result.commandType).to.equals(CommandVerbs.HINT);
    });
    it('should detect a SYNTAX_ERROR if the command is not preceded by a "!"', () => {
        const command = new HintCommand('indice', testRoom, testPlayer, finderMock, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE);
    });
    it('should return to the sender NoHintFound if it finds none', () => {
        sinon.stub(finderMock, 'getPlacement').returns([]);
        testPlayer.isItsTurn = true;
        const command = new HintCommand(validText, testRoom, testPlayer, finderMock, chatMessageService);
        const result = command.execute();
        expect(chatMessageService.isError).to.eql(false);
        expect(result.messageToSender).to.eql('Aucun indice trouvé');
    });
});
