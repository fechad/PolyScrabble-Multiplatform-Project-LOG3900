import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { HINT_COMMAND_LENGTH, SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from '@app/constants/command-constants';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { Command } from './command';
import { CommandVerbs } from '@app/enums/command-verbs';
const HINTS_NUMBERS = 5;
export class HintCommand extends Command {
    private readonly commandParameters: string[];
    private finder: PlacementFinder;

    constructor(command: string, room: Room, sender: Player, finder: PlacementFinder, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
        this.commandParameters = this.splitCommand();
        if (finder) this.finder = finder;
    }

    execute(): CommandResult {
        this.checkForErrors();
        return {
            messageToSender: this.lookForHints(),
            commandType: CommandVerbs.HINT,
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
    }

    private isSyntaxValid(): boolean {
        if (this.command !== `!${CommandVerbs.HINT}`) return false;
        if (this.commandParameters.length !== HINT_COMMAND_LENGTH) return false;
        return true;
    }

    private lookForHints(): string {
        const receivedStrings = this.finder.getPlacement(this.commandSender.rack.getLetters());
        if (receivedStrings.length === 0) {
            return '0';
        }
        const included: string[] = [];
        let messageToReturn = '';
        let count = 0;
        receivedStrings.sort((rightPlacement, leftPlacement) => (leftPlacement.points || 0) - (rightPlacement.points || 0));
        for (const hint of receivedStrings) {
            if (included.includes(hint.newWord)) continue;
            messageToReturn += hint.row + hint.col + hint.direction + '-' + hint.letters + '_' + hint.points + ' ';
            count++;
            included.push(hint.newWord);
            if (count >= HINTS_NUMBERS) break;
        }
        return messageToReturn + ' ' + count;
    }
}
