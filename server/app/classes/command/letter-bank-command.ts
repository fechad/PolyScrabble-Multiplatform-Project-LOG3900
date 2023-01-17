import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandVerbs } from '@app/enums/command-verbs';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { Command } from './command';
import { SYNTAX_ERROR_MESSAGE } from './constants';

export class LetterBankCommand extends Command {
    constructor(command: string, room: Room, sender: Player, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
    }
    execute(): CommandResult {
        this.checkForErrors();
        return {
            messageToSender: this.createMessageToSender(),
            commandType: CommandVerbs.BANK,
        };
    }

    private checkForErrors() {
        if (!this.isSyntaxValid()) {
            this.chatMessageService.addError(SYNTAX_ERROR_MESSAGE);
        }
    }

    private isSyntaxValid(): boolean {
        return this.command === `!${CommandVerbs.BANK}`;
    }

    private createMessageToSender(): string {
        return this.room.letterBank.stringifyContent();
    }
}
