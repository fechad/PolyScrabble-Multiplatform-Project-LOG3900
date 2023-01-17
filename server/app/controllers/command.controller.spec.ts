import { CommandVerbs } from '@app/classes/command/command-verbs';
import { INVALID_ERROR_MESSAGE, WAIT_TURN_ERROR } from '@app/classes/command/constants';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { PlacementDirections } from '@app/enums/placement-directions';
import { UserPlacement } from '@app/interfaces/user-placement';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { CommandController } from './command.controller';

describe('CommandController', () => {
    const validExchangeCommand = '!échanger hgfr';
    const validPlacementCommand = '!placer h7h bonjour';
    const validSkipTurnCommand = '!passer';
    const invalidPLacementCommand = '!placer g9h bonjour';
    const socketMock = 'AbHeIU';
    const socketMock2 = 'IUAAAR';
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
    let commandController: CommandController;
    let testRoom: Room;
    let testPlayer: Player;
    let chatMessageService: ChatMessageService;
    beforeEach(async () => {
        chatMessageService = new ChatMessageService();
        commandController = new CommandController(chatMessageService);
        testRoom = new Room();
        testPlayer = new Player(socketMock, 'David', true);
        testPlayer.rack.setLetters('hgfrabc');
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, 'Hamza', false));
        // eslint-disable-next-line dot-notation -- we want to access private attribute to test
        testRoom['gameManager'].placementFinder = finderMock;
    });

    it('should return false when getting an empty string', async () => {
        const result: boolean = commandController.hasCommandSyntax('');
        return expect(result).to.be.false;
    });
    it('should return false when first character is not "!" ', async () => {
        const result: boolean = commandController.hasCommandSyntax('hello world');
        return expect(result).to.be.false;
    });
    it('should return true when first character is "!" ', async () => {
        const result: boolean = commandController.hasCommandSyntax('!passer');
        return expect(result).to.be.true;
    });
    it('should throw INVALID_ERROR_MESSAGE when the verb of the command is not in ["placer", "échanger", "passer"]', () => {
        testPlayer.isItsTurn = true;
        commandController.executeCommand('!nonSense g9h bonjour', testRoom, testPlayer);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(INVALID_ERROR_MESSAGE);
    });

    it('should detect INVALID_ERROR_MESSAGE when the verb is "échanger" without the accent', () => {
        testPlayer.isItsTurn = true;
        commandController.executeCommand('!echanger g9h bonjour', testRoom, testPlayer);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(INVALID_ERROR_MESSAGE);
    });

    it('should detect INVALID_ERROR_MESSAGE when the verb typed by the user contains the correct verb', () => {
        testPlayer.isItsTurn = true;
        commandController.executeCommand('!échangerr g9h bonjour', testRoom, testPlayer);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(INVALID_ERROR_MESSAGE);
    });

    it('should detect INVALID_ERROR_MESSAGE when the verb is valid but it is not preceded by "!"', () => {
        testPlayer.isItsTurn = true;
        commandController.executeCommand('passer', testRoom, testPlayer);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(INVALID_ERROR_MESSAGE);
    });

    it('should skip the turn at the end of a valid exchange command', () => {
        testPlayer.isItsTurn = true;
        testPlayer.rack.setLetters('bonjour');
        commandController.executeCommand('!échanger bon', testRoom, testPlayer);
        expect(testPlayer.isItsTurn).to.equals(false);
    });

    it('should skip the turn at the end of a valid placement command', () => {
        testPlayer.isItsTurn = true;
        testPlayer.rack.setLetters('bonjour');
        commandController.executeCommand(validPlacementCommand, testRoom, testPlayer);
        expect(testPlayer.isItsTurn).to.equals(false);
    });
    it('should skip the turn at the end of a valid skip turn command', () => {
        testPlayer.isItsTurn = true;
        testPlayer.rack.setLetters('bonjour');
        commandController.executeCommand(validSkipTurnCommand, testRoom, testPlayer);
        expect(testPlayer.isItsTurn).to.equals(false);
    });

    describe('tests for the command "placer"', () => {
        it('should detect an error when the command is "placer" but cannot be executed', () => {
            testPlayer.isItsTurn = true;
            commandController.executeCommand(invalidPLacementCommand, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(true);
        });

        it('should not detect an error when the command is "placer" and executable', () => {
            testPlayer.isItsTurn = true;
            testPlayer.rack.setLetters('bonjour');
            commandController.executeCommand(validPlacementCommand, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(false);
        });
    });

    describe('test for the command "reserve"', () => {
        it('should not detect an error when the command is executable', () => {
            const command = `!${CommandVerbs.BANK}`;
            commandController.executeCommand(command, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(false);
        });
    });

    describe('test for the command "aide"', () => {
        it('should not detect an error  when the command is executable', () => {
            const command = `!${CommandVerbs.HELP}`;
            commandController.executeCommand(command, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(false);
        });
    });

    describe('test for the command "hint"', () => {
        it('should not detect errors when the command is executable', () => {
            testPlayer.isItsTurn = true;
            const command = `!${CommandVerbs.HINT}`;
            testPlayer.isItsTurn = true;
            commandController.executeCommand(command, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(false);
        });
    });

    describe('tests for the command "échanger"', () => {
        it('should detect WAIT_TURN_ERROR when a command cannot be executed because it it not the player turn to play', () => {
            testPlayer.isItsTurn = false;
            commandController.executeCommand(validExchangeCommand, testRoom, testPlayer);
            expect(chatMessageService.isError).to.eql(true);
            expect(chatMessageService.message.text).to.eql(WAIT_TURN_ERROR);
        });
        it('should return the switched letters to the bank', () => {
            testPlayer.isItsTurn = true;
            testPlayer.rack.setLetters('bonjour');
            const quantityThen: number[] = [];
            const quantityNow: number[] = [];
            // bank has to return letters different from b and o
            sinon.stub(testRoom.letterBank, 'fetchRandomLetters').callsFake(() => {
                return '**';
            });
            quantityThen.push(testRoom.letterBank.getLetterQuantity('b') as number);
            quantityThen.push(testRoom.letterBank.getLetterQuantity('o') as number);

            commandController.executeCommand('!échanger bo', testRoom, testPlayer);

            quantityNow.push((testRoom.letterBank.getLetterQuantity('b') as number) - 1);
            quantityNow.push((testRoom.letterBank.getLetterQuantity('o') as number) - 1);

            expect(quantityNow).to.eql(quantityThen);
        });
    });
});
