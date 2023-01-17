import { Command } from '@app/classes/command/command';
import {
    ALMOST_EMPTY_BANK_ERROR,
    ECHANGER_COMMAND_LENGTH,
    MINIMUM_BANK_LETTERS_FOR_EXCHANGE,
    SYNTAX_ERROR_MESSAGE,
    WAIT_TURN_ERROR,
} from '@app/classes/command/constants';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { CommandVerbs } from './command-verbs';

const lettersIndex = 1;
export class ExchangeLettersCommand extends Command {
    private readonly commandParameters: string[];
    constructor(command: string, room: Room, sender: Player, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
        this.commandParameters = this.splitCommand();
    }

    execute(): CommandResult {
        this.checkForErrors();
        if (this.chatMessageService.isError) return {} as CommandResult;
        const messageRack = this.throwRackErrors();
        this.room.letterBank.insertLetters(this.commandParameters[lettersIndex]);
        return {
            messageToSender: messageRack,
            messageToOthers: this.createMessageToOthers(),
            commandType: CommandVerbs.SWITCH,
        };
    }

    private checkForErrors() {
        if (!this.isPlayerTurn()) {
            this.chatMessageService.addError(WAIT_TURN_ERROR);
            return;
        }
        if (!this.isSyntaxValid()) {
            this.chatMessageService.addError(SYNTAX_ERROR_MESSAGE);
            return;
        }
        if (!this.letterBankHasEnoughLetters()) {
            this.chatMessageService.addError(ALMOST_EMPTY_BANK_ERROR);
            return;
        }
    }

    private isSyntaxValid(): boolean {
        if (this.commandParameters.length !== ECHANGER_COMMAND_LENGTH) return false;
        return true;
    }

    private throwRackErrors(): string {
        const message = this.commandSender.rack.switchLetters(this.commandParameters[lettersIndex], this.room.letterBank);
        const splittedMessage = message.split(' ');
        if (splittedMessage[0] === 'Erreur') {
            this.chatMessageService.addError(message);
        }
        return message;
    }
    private letterBankHasEnoughLetters(): boolean {
        return this.room.letterBank.getLettersCount() >= MINIMUM_BANK_LETTERS_FOR_EXCHANGE;
    }

    private createMessageToOthers(): string {
        return `${this.commandSender.pseudo} à échangé ${this.commandParameters[lettersIndex].length} de ses lettres`;
    }
}
