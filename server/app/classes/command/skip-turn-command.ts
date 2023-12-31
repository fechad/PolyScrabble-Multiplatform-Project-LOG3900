import { Command } from '@app/classes/command/command';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { PASSER_COMMAND_LENGTH, SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from '@app/constants/command-constants';
import { CommandVerbs } from '@app/enums/command-verbs';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';

export class SkipTurnCommand extends Command {
    private readonly commandParameters: string[];

    constructor(command: string, room: Room, sender: Player, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
        this.commandParameters = this.splitCommand();
    }

    execute(): CommandResult {
        this.checkForErrors();
        if (this.isPlayerTurn()) {
            if (this.commandSender instanceof VirtualPlayer === false) this.room.incrementTurnPassedCounter();
            this.room.changePlayerTurn();
        }
        return {
            message: this.createExecutionMessage(),
            commandData: {},
            commandType: CommandVerbs.SKIP,
        };
    }
    private checkForErrors() {
        if (!this.isPlayerTurn()) {
            this.chatMessageService.addError(WAIT_TURN_ERROR);
            return;
        }
        if (!this.isSyntaxValid()) {
            this.chatMessageService.addError(SYNTAX_ERROR_MESSAGE);
        }
    }

    private isSyntaxValid(): boolean {
        if (this.commandParameters.length !== PASSER_COMMAND_LENGTH) return false;
        if (this.command !== `!${CommandVerbs.SKIP}`) return false;
        return true;
    }

    private createExecutionMessage(): string {
        return `${this.commandSender.pseudo} passe son tour`;
    }
}
