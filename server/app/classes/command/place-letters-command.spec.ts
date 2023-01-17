/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { BoardMessage } from '@app/classes/board-model/board-message';
import { GoalTitle } from '@app/enums/goal-titles';
import { THIRTY_POINTS_NEEDED_FOR_REWARD, TOTAL_POINTS_NEEDED_FOR_REWARD } from '@app/classes/goals/goals-constants';
import { Matcher } from '@app/classes/goals/matcher';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandVerbs } from '@app/enums/command-verbs';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import { SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from './constants';
import { PlaceLettersCommand } from './place-letters-command';
import { PlacementData } from '@app/interfaces/placement-data';
import { PlacementDirections } from '@app/enums/placement-directions';
import { BoardMessageTitle } from '@app/enums/board-message-title';

describe('PlaceLettersCommand', () => {
    const name = 'David';
    const socketMock1 = 'AbHeIU';
    const socketMock2 = 'B4Y';
    let validText = '!passer';
    let testRoom: Room;
    let testPlayer: Player;
    let validCommand: PlaceLettersCommand;
    let chatMessageService: ChatMessageService;

    beforeEach(async () => {
        testRoom = new Room();
        testPlayer = new Player(socketMock1, name, false);
        testPlayer.isItsTurn = true;
        testPlayer.managerId = 0;
        testPlayer.rack.setLetters('bonjour');
        testRoom.addPlayer(testPlayer);
        testRoom.addPlayer(new Player(socketMock2, name, true));
        validText = '!placer h7h bonjour';
        chatMessageService = new ChatMessageService();
        validCommand = new PlaceLettersCommand(validText, testRoom, testPlayer, chatMessageService);
    });

    it('should detect INVALID_SYNTAX error when the command is empty', () => {
        new PlaceLettersCommand('', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql('la commande que vous avez entré ne contient pas exactement 3 parametres');
    });

    it('should dtect WAIT_TURN_ERROR error when it is not the player"s turn to play', () => {
        testPlayer.isItsTurn = false;
        const command = new PlaceLettersCommand(validText, testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(WAIT_TURN_ERROR);
    });

    it('should detect SYNTAX_ERROR_MESSAGE when the command is "Placer" but it is missing the word to place', () => {
        const placementCommand = new PlaceLettersCommand('!placer h7h', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql('la commande que vous avez entré ne contient pas exactement 3 parametres');
        chatMessageService.restore();
        placementCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql('Erreur de syntaxe: la commande que vous avez entré ne contient pas exactement 3 parametres');
    });

    it('should detect SYNTAX_ERROR_MESSAGE when the word to place is too big', () => {
        const expected = SYNTAX_ERROR_MESSAGE + ': le mot a une longueur plus grande que 7';
        const placementCommand = new PlaceLettersCommand('!placer g9h hahahahahaha', testRoom, testPlayer, chatMessageService);
        placementCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(expected);
    });

    it('should increment when the player"s score when the command is valid and the word is worth at least 1 point', () => {
        const initialScore = testPlayer.points;
        validCommand.execute();
        const finalScore = testPlayer.points;
        expect(finalScore).to.be.greaterThan(initialScore);
    });

    it('should not detect when the command is executable', () => {
        const command = new PlaceLettersCommand('!placer h7h bonjour', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(false);
    });

    it('The message returned should contain the name of the sender when executing a sucessful command', () => {
        const report = new PlaceLettersCommand('!placer h7h bonjour', testRoom, testPlayer, chatMessageService).execute();
        expect(report.message?.includes(testPlayer.pseudo)).to.equal(true);
    });
    it('The error message detected when the command cannot be executed by the model should not contain the name of the sender', () => {
        new PlaceLettersCommand('!placer b300g bonjour', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text.includes(testPlayer.pseudo)).to.eql(false);
    });

    it('should detect INVALID_SYNTAX error when the player does not have the letters that he wants to place', () => {
        testPlayer.rack.setLetters('abaobab');
        const command = new PlaceLettersCommand('!placer h7h bonjour', testRoom, testPlayer, chatMessageService);
        command.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE + ': une ou plusieurs letters ne sont pas dans le chevalet');
    });
    it('should not detect an error when creating a command with a single letter without the direction specified', () => {
        testPlayer.rack.setLetters('abcdefg');
        new PlaceLettersCommand('!placer h8 a', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should detect INVALID_SYNTAX error when creating the command with an incomplete position argument', () => {
        testPlayer.rack.setLetters('abaobab');
        new PlaceLettersCommand('!placer h a', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE + ': Argument position invalid');
    });
    it('should detect a SYNTAX ERROR when placing a word without the direction specified', () => {
        new PlaceLettersCommand('!placer h8 bon', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE + ': la direction n"est pas specifié');
    });
    it('should detect an error when fillRack returns an error', () => {
        sinon.stub(testPlayer.rack, 'fillRack').returns('Erreur');
        validCommand.execute();
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql('Erreur');
    });
    it('should extract the arguments correctly', () => {
        const spy = sinon.spy(testRoom, 'askPlacement');
        try {
            new PlaceLettersCommand('!placer h10v bon', testRoom, testPlayer, chatMessageService).execute();
        } catch (error) {
            const correctArguments: PlacementData = {
                word: 'bon',
                row: 'h',
                column: 10,
                direction: PlacementDirections.Vertical,
            };
            expect(spy.calledWith(correctArguments)).to.equal(true);
        }
    });
    it('should extract the arguments correctly when the word contains only one letter and the direction is missing', () => {
        const spy = sinon.spy(testRoom, 'askPlacement');
        try {
            new PlaceLettersCommand('!placer h8 b', testRoom, testPlayer, chatMessageService).execute();
        } catch (error) {
            const correctArguments: PlacementData = {
                word: 'b',
                row: 'h',
                column: 8,
                direction: PlacementDirections.Horizontal,
            };
            expect(spy.calledWith(correctArguments)).to.equal(true);
        }
    });
    it('should not detect an error when the direction is missing, but the word contains only one letter', () => {
        new PlaceLettersCommand('!placer h8 b', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(false);
    });
    it('should detect an error when the direction is missing, but the word contains more than one letter', () => {
        new PlaceLettersCommand('!placer h8 bon', testRoom, testPlayer, chatMessageService);
        expect(chatMessageService.isError).to.eql(true);
        expect(chatMessageService.message.text).to.eql(SYNTAX_ERROR_MESSAGE + ': la direction n"est pas specifié');
    });

    describe('isDirectionInPositionArgument() tests', () => {
        it('should return false when provided an epmty string', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const result = prototpye.isDirectionInPositionArgument('');
            expect(result).to.equal(false);
        });
        it('should return false when the direction is not provided', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const result = prototpye.isDirectionInPositionArgument('h10');
            expect(result).to.equal(false);
        });
        it('should return false when the direction is provided', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const result = prototpye.isDirectionInPositionArgument('h10v');
            expect(result).to.equal(true);
        });
    });
    describe('updateScore tests', () => {
        it('should not update the player"s score when the score in the message is not defined', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const message: BoardMessage = { title: BoardMessageTitle.NoRulesBroken };
            const initialScore = testPlayer.points;
            prototpye.updateScore(message);
            expect(testPlayer.points).to.equal(initialScore);
        });
    });
    describe('verifyGoalsAchievement tests', () => {
        const spy = sinon.spy(Matcher, 'notifyGoalManager');

        it('should notify goalManager that FirstToHundred goal is achieved ', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const message: BoardMessage = { title: BoardMessageTitle.NoRulesBroken };
            testPlayer.points = TOTAL_POINTS_NEEDED_FOR_REWARD;
            prototpye.verifyGoalsAchievement(message);
            expect(spy.calledWith(testPlayer, GoalTitle.FirstToHundred));
        });
        it('should notify goalManager that ThirtyPointer goal is achieved ', () => {
            const prototpye = validCommand as any;
            const message: BoardMessage = { title: BoardMessageTitle.NoRulesBroken };
            message.score = THIRTY_POINTS_NEEDED_FOR_REWARD;
            prototpye.commandSender.points = TOTAL_POINTS_NEEDED_FOR_REWARD;
            prototpye.verifyGoalsAchievement(message);
            expect(spy.calledWith(prototpye.commandSender, GoalTitle.ThirtyPointer));
        });
        it('should notify goalManager that NoChangeNoPass goal is achieved ', () => {
            const prototpye = Object.getPrototypeOf(validCommand);
            const message: BoardMessage = { title: BoardMessageTitle.NoRulesBroken };
            testPlayer.lastThreeCommands?.push(prototpye);
            testPlayer.lastThreeCommands?.push(prototpye);
            prototpye.verifyGoalsAchievement(message);
            expect(spy.calledWith(testPlayer, GoalTitle.NoChangeNoPass));
        });
    });
    describe('checkNoChangeNoPass tests', () => {
        const commandResult: CommandResult = { commandType: CommandVerbs.PLACE };
        it('should check if NoChangeNoPass goal is achieved ', () => {
            const prototpye = validCommand as any;
            testPlayer.points = TOTAL_POINTS_NEEDED_FOR_REWARD;
            prototpye.commandSender.addCommand(commandResult);
            prototpye.commandSender.addCommand(commandResult);
            expect(prototpye.checkNoChangeNoPass()).to.equal(true);
        });
    });
});
