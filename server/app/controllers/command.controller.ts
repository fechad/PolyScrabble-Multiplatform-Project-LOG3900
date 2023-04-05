import { Command } from '@app/classes/command/command';
import { ExchangeLettersCommand } from '@app/classes/command/exchange-command';
import { HelpCommand } from '@app/classes/command/help-command';
import { HintCommand } from '@app/classes/command/hint-command';
import { LetterBankCommand } from '@app/classes/command/letter-bank-command';
import { PlaceLettersCommand } from '@app/classes/command/place-letters-command';
import { SkipTurnCommand } from '@app/classes/command/skip-turn-command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { TrumpVirtualPlayer } from '@app/classes/virtual-player/themed-virtual-players/trump-vp';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COMMAND_STARTING_SYMBOL, INVALID_ERROR_MESSAGE } from '@app/constants/command-constants';
import { CommandVerbs } from '@app/enums/command-verbs';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { SocketManager } from '@app/services/socket-manager.service';
import * as io from 'socket.io';
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
    executeCommand(command: string, room: Room, sender: Player, socket?: io.Socket): CommandResult | undefined {
        this.room = room;
        this.sender = sender;
        this.splittedCommand = this.splitCommand(command);
        switch (this.splittedCommand[commandIndex]) {
            case CommandVerbs.PLACE: {
                if (!sender.isItsTurn) return;
                if (socket && sender instanceof TrumpVirtualPlayer && (sender as TrumpVirtualPlayer).mustKeepTurn) {
                    this.executePlaceCommand(command, true);
                    (sender as TrumpVirtualPlayer).mustKeepTurn = false;
                    SocketManager.instance.socketGameService.notifyViewBasedOnCommandResult(this.executionResult, this.room, sender, socket);
                    SocketManager.instance.socketGameService.handleNewPlayerTurn(socket, room, sender);
                    return;
                }
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

    private isSenderRealPlayer() {
        return this.sender instanceof VirtualPlayer === false;
    }
    private splitCommand(text: string): string[] {
        const splittedCommand = text.split(' ');
        splittedCommand[0] = splittedCommand[0].substring(1);
        return splittedCommand;
    }
    private executePlaceCommand(command: string, isNoSkip?: boolean) {
        this.command = new PlaceLettersCommand(command, this.room, this.sender, this.chatMessageService);
        if (this.chatMessageService.isError) return;
        this.executionResult = this.command.execute();
        if (isNoSkip) {
            this.keepTurn();
            return;
        }
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
        if (this.isSenderRealPlayer() || this.room.isSolo) this.room.resetTurnPassedCounter();
    }
    private keepTurn() {
        if (this.chatMessageService.isError) return;
        this.room.elapsedTime = 1;
        if (this.isSenderRealPlayer() || this.room.isSolo) this.room.resetTurnPassedCounter();
    }
}
