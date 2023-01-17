import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { SCORE_INTERVALS } from '@app/constants/virtual-player-constants';
import { CommandResult } from '@app/interfaces/command-result';
import { ChatMessageService } from '@app/services/chat.message';
import { Command } from './command';
import { CommandVerbs } from './command-verbs';
import { HINT_COMMAND_LENGTH, SYNTAX_ERROR_MESSAGE, WAIT_TURN_ERROR } from './constants';
const HINTS_NUMBERS = 3;
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
        const receivedStrings = this.finder.getPlacement(SCORE_INTERVALS.hint, this.commandSender.rack.getLetters());
        if (receivedStrings.length === 0) {
            return 'Aucun indice trouvé';
        }
        const included: string[] = [];
        let messageToReturn = '';
        let count = 0;
        for (const hint of receivedStrings.reverse()) {
            if (included.includes(hint.newWord)) continue;
            messageToReturn +=
                'Vous pouvez former le mot ' +
                hint.newWord +
                ',\nen effectuant le placement: \n' +
                '!placer ' +
                hint.row +
                hint.col +
                hint.direction +
                ' ' +
                hint.letters +
                '\n\n';
            count++;
            included.push(hint.newWord);
            if (count >= HINTS_NUMBERS) break;
        }
        if (receivedStrings.length < HINTS_NUMBERS) {
            messageToReturn += 'Seulement ' + count + ' indices trouvés';
        }
        return messageToReturn;
    }
}
