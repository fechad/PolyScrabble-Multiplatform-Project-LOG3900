import { Command } from '@app/classes/command/command';
import { CommandVerbs } from '@app/classes/command/command-verbs';
import { COMMAND_STARTING_SYMBOL, INVALID_ERROR_MESSAGE } from '@app/classes/command/constants';
import { ExchangeLettersCommand } from '@app/classes/command/exchange-command';
import { HelpCommand } from '@app/classes/command/help-command';
import { HintCommand } from '@app/classes/command/hint-command';
import { LetterBankCommand } from '@app/classes/command/letter-bank-command';
import { PlaceLettersCommand } from '@app/classes/command/place-letters-command';
import { SkipTurnCommand } from '@app/classes/command/skip-turn-command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { Service } from 'typedi';

const commandIndex = 0;

@Service()
export class CommandController {
    private command: Command;
    private executionResult: CommandResult;
    private room: Room;
    private sender: Player;
    private splittedCommand: string[];
    constructor(private chatMessageService: ChatMessageService) {}
    executeCommand(command: string, room: Room, sender: Player): CommandResult | undefined {
        this.room = room;
        this.sender = sender;
        this.splittedCommand = this.splitCommand(command);
        switch (this.splittedCommand[commandIndex]) {
            case CommandVerbs.PLACE: {
                this.executePlaceCommand(command);
                break;
            }
            case CommandVerbs.SWITCH: {
                this.executeSwitchCommand(command);
                break;
            }
            case CommandVerbs.SKIP: {
                this.executeSkipCommand(command);
                break;
            }
            case CommandVerbs.BANK: {
                this.executeLetterBankCommand(command);
                break;
            }
            case CommandVerbs.HINT: {
                this.executeHintCommand(command);
                break;
            }
            case CommandVerbs.HELP: {
                this.executeHelpCommand(command);
                break;
            }
            default:
                this.chatMessageService.addError(INVALID_ERROR_MESSAGE);
        }
        return this.executionResult;
    }

    hasCommandSyntax(text: string): boolean {
        if (text === '') {
            return false;
        }
        return text[0] === COMMAND_STARTING_SYMBOL;
    }
    private splitCommand(text: string): string[] {
        const splittedCommand = text.split(' ');
        splittedCommand[0] = splittedCommand[0].substring(1);
        return splittedCommand;
    }
    private executePlaceCommand(command: string) {
        this.command = new PlaceLettersCommand(command, this.room, this.sender, this.chatMessageService);
        if (this.chatMessageService.isError) return;
        this.executionResult = this.command.execute();
        this.changeTurn();
    }
    private executeSwitchCommand(command: string) {
        this.command = new ExchangeLettersCommand(command, this.room, this.sender, this.chatMessageService);
        this.executionResult = this.command.execute();
        this.changeTurn();
    }
    private executeSkipCommand(command: string) {
        this.command = new SkipTurnCommand(command, this.room, this.sender, this.chatMessageService);
        this.executionResult = this.command.execute();
    }
    private executeLetterBankCommand(command: string) {
        this.command = new LetterBankCommand(command, this.room, this.sender, this.chatMessageService);
        this.executionResult = this.command.execute();
    }
    private executeHintCommand(command: string) {
        this.command = new HintCommand(command, this.room, this.sender, this.room.placementFinder, this.chatMessageService);
        this.executionResult = this.command.execute();
    }
    private executeHelpCommand(command: string) {
        this.command = new HelpCommand(command, this.room, this.sender, this.chatMessageService);
        this.executionResult = this.command.execute();
    }
    private changeTurn() {
        if (this.chatMessageService.isError) return;
        this.room.changePlayerTurn();
        this.room.resetTurnPassedCounter();
    }
}
