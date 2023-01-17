import { BoardMessage } from '@app/classes/board-model/board-message';
import { DirectionHandler } from '@app/classes/board-model/handlers/direction-handler';
import { THIRTY_POINTS_NEEDED_FOR_REWARD, TOTAL_POINTS_NEEDED_FOR_REWARD } from '@app/classes/goals/goals-constants';
import { Matcher } from '@app/classes/goals/matcher';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { RACK_CAPACITY } from '@app/constants/constants';
import { BoardMessageTitle } from '@app/enums/board-message-title';
import { GoalTitle } from '@app/enums/goal-titles';
import { CommandResult } from '@app/interfaces/command-result';
import { PlacementData } from '@app/interfaces/placement-data';
import { ChatMessageService } from '@app/services/chat.message';
import { Command } from './command';
import { CommandVerbs } from './command-verbs';
import {
    DEFAULT_PLACEMENT_DIRECTION,
    MINIMUM_WORD_LENGTH,
    MINIMUM_WORD_LENGTH_WITHOUT_DIRECTION,
    PLACER_COMMAND_LENGTH,
    SYNTAX_ERROR_MESSAGE,
    WAIT_TURN_ERROR,
} from './constants';

const positionArgumentsIndex = 1;
const placeLettersIndex = 2;
export class PlaceLettersCommand extends Command {
    private readonly commandParameters: string[];
    private readonly placementArguments: PlacementData;
    private errorSpecification: string;
    constructor(command: string, room: Room, sender: Player, private chatMessageService: ChatMessageService) {
        super(command, room, sender);
        this.commandParameters = this.splitCommand();
        this.placementArguments = this.extractPlacementArguments();
    }
    execute(): CommandResult {
        if (this.checkForErrors()) return {} as CommandResult;
        const message: BoardMessage = this.room.askPlacement(this.placementArguments);
        if (this.checkForModelErrors(message)) return {} as CommandResult;
        this.updateScore(message);
        this.getReplacementForPlacedLetters();
        return {
            message: this.createExecutionMessage(message),
            commandData: this.placementArguments,
            commandType: CommandVerbs.PLACE,
        };
    }
    private checkForModelErrors(message: BoardMessage): boolean {
        if (!this.isExecutionSuccessful(message)) {
            this.chatMessageService.addError(this.createExecutionMessage(message));
            return true;
        }
        return false;
    }
    private updateScore(message: BoardMessage) {
        if (!message.score) return;
        this.commandSender.points += message.score;
        this.verifyGoalsAchievement(message);
    }

    private verifyGoalsAchievement(message: BoardMessage) {
        if (!message.score) return;
        if (this.commandSender.points >= TOTAL_POINTS_NEEDED_FOR_REWARD) Matcher.notifyGoalManager(this.commandSender, GoalTitle.FirstToHundred);
        if (message.score >= THIRTY_POINTS_NEEDED_FOR_REWARD) Matcher.notifyGoalManager(this.commandSender, GoalTitle.ThirtyPointer);
        if (this.checkNoChangeNoPass()) Matcher.notifyGoalManager(this.commandSender, GoalTitle.NoChangeNoPass);
    }

    private checkNoChangeNoPass(): boolean | undefined {
        if (!this.commandSender.lastThreeCommands) return;
        if (this.commandSender.lastThreeCommands.length < 2) return;
        const placeCommand = this.commandSender.lastThreeCommands.filter((command) => command.commandType === CommandVerbs.PLACE);
        return placeCommand.length === 2;
    }
    private checkForErrors(): boolean {
        if (!this.isPlayerTurn()) {
            this.chatMessageService.addError(WAIT_TURN_ERROR);
            return true;
        }
        if (!this.isSyntaxValid()) {
            this.chatMessageService.addError(SYNTAX_ERROR_MESSAGE + this.errorSpecification);
            return true;
        }
        return false;
    }
    private getReplacementForPlacedLetters(): string {
        const lettersToReplace = this.placementArguments.word;
        const bank = this.room.letterBank;
        const rackResult = this.commandSender.rack.fillRack(lettersToReplace, bank);
        this.addChatError(rackResult);
        return rackResult;
    }
    private addChatError(message: string) {
        if (message.split(' ')[0] === 'Erreur') {
            this.chatMessageService.addError(message);
        }
    }

    private isExecutionSuccessful(boardMessage: BoardMessage): boolean {
        return boardMessage.title === BoardMessageTitle.SuccessfulPlacement;
    }

    private isWordLengthValid(word: string): boolean {
        return word.length >= MINIMUM_WORD_LENGTH && word.length <= RACK_CAPACITY;
    }

    private createExecutionMessage(boardMessage: BoardMessage): string {
        if (this.isExecutionSuccessful(boardMessage)) {
            return `${this.commandSender.pseudo} ${boardMessage.content}\n +${boardMessage.score} points`;
        }
        return `${boardMessage.title} : ${boardMessage.content}`;
    }

    private isSyntaxValid(): boolean {
        if (this.commandParameters.length !== PLACER_COMMAND_LENGTH) {
            this.errorSpecification = `: la commande que vous avez entré ne contient pas exactement ${PLACER_COMMAND_LENGTH} parametres`;
            return false;
        }
        if (!this.isWordLengthValid(this.placementArguments.word)) {
            this.errorSpecification = ': le mot a une longueur plus grande que 7';
            return false;
        }
        if (!this.isInRack()) {
            this.errorSpecification = ': une ou plusieurs letters ne sont pas dans le chevalet';
            return false;
        }
        return true;
    }
    private isInRack(): boolean {
        const foundIndexes = this.commandSender.rack.findLetters(this.placementArguments.word);
        return foundIndexes.length !== 0;
    }

    private handlePositionArgumentValidity(positions: string): boolean {
        if (!this.isPositionArgumentValid(positions)) {
            this.chatMessageService.addError(`${SYNTAX_ERROR_MESSAGE}: Argument position invalid`);
            return false;
        }
        return true;
    }

    private handleWordArgumentValidity(word: string): boolean {
        if (word.length !== MINIMUM_WORD_LENGTH_WITHOUT_DIRECTION) {
            this.chatMessageService.addError(`${SYNTAX_ERROR_MESSAGE}: la direction n"est pas specifié`);
            return false;
        }
        return true;
    }
    private extractPlacementArguments(): PlacementData {
        if (this.commandParameters.length !== PLACER_COMMAND_LENGTH) {
            this.chatMessageService.addError(`la commande que vous avez entré ne contient pas exactement ${PLACER_COMMAND_LENGTH} parametres`);
            return {} as PlacementData;
        }
        let positions = this.commandParameters[positionArgumentsIndex];
        if (!this.handlePositionArgumentValidity(positions)) return {} as PlacementData;
        const letters = this.commandParameters[placeLettersIndex];
        let directionArgument = '';
        if (!this.isDirectionInPositionArgument(positions)) {
            if (!this.handleWordArgumentValidity(letters)) return {} as PlacementData;
            directionArgument = DEFAULT_PLACEMENT_DIRECTION;
        } else {
            directionArgument = positions[positions.length - 1];
            const endIndex = -1;
            positions = positions.slice(0, endIndex);
        }
        const columnIndex = positions[0];
        const rowArgument = positions.substring(1);
        return {
            word: letters,
            row: columnIndex,
            column: parseInt(rowArgument, 10),
            direction: DirectionHandler.getPlacementDirections(directionArgument),
        };
    }
    private isPositionArgumentValid(positionArgument: string): boolean {
        const testWithDirection = new RegExp('[a-o]{1}((1[0-5])|[0-9])(h|v)').test(positionArgument);
        const testWithoutDirection = new RegExp('[a-o]{1}((1[0-5])|[0-9])').test(positionArgument) && positionArgument.length <= 3;
        return testWithDirection || testWithoutDirection;
    }

    private isAlpha(text: string): boolean {
        return /^[A-Z]$/i.test(text);
    }

    private isDirectionInPositionArgument(position: string): boolean {
        if (position.length <= 1) return false;
        const lastChar = position[position.length - 1];
        return this.isAlpha(lastChar);
    }
}
