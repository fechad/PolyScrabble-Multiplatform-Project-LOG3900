import { Command } from '@app/classes/command/command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { HELP_COMMAND_LENGTH, HELP_MESSAGE, SYNTAX_ERROR_MESSAGE } from '@app/constants/command-constants';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { CommandVerbs } from '@app/enums/command-verbs';

export class HelpCommand extends Command {
    private readonly commandParameters: string[];

    constructor(command: string, room: Room, sender: Player, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
        this.commandParameters = this.splitCommand();
    }

    execute(): CommandResult {
        this.checkForErrors();
        return {
            messageToSender: this.createExecutionMessage(),
            commandData: {},
            commandType: CommandVerbs.HELP,
        };
    }
    private checkForErrors() {
        if (!this.isSyntaxValid()) {
            this.chatMessageService.addError(SYNTAX_ERROR_MESSAGE);
        }
    }

    private isSyntaxValid(): boolean {
        if (this.commandParameters.length !== HELP_COMMAND_LENGTH) return false;
        if (this.command !== `!${CommandVerbs.HELP}`) return false;
        return true;
    }

    private createExecutionMessage(): string {
        return HELP_MESSAGE;
    }
}
