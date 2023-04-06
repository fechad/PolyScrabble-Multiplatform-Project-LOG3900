import { Injectable } from '@angular/core';
import { Command } from '@app/classes/command/abstract-command';
import { PlaceDraggedLetter } from '@app/classes/command/place-dragged-letter';
import { PlaceLetter } from '@app/classes/command/place-letter';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Tile } from '@app/classes/tile';
import { A_ASCII } from '@app/constants/constants';
import { PlacementType } from '@app/enums/placement-type';
import { SocketEvent } from '@app/enums/socket-event';
import { ANY_ARROW, DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { SocketClientService } from './socket-client.service';

const PLACE_COMMAND = '!placer';
@Injectable({
    providedIn: 'root',
})
export class CommandInvokerService {
    canSelectFirstCaseForPlacement: boolean;
    firstSelectedCaseForPlacement: string;
    selectedTile: PlaceLetterInfo | undefined;

    private cancelStack: Command[];

    constructor(private socketService: SocketClientService) {
        this.cancelStack = [];
        this.canSelectFirstCaseForPlacement = true;
        this.firstSelectedCaseForPlacement = '';
    }

    get commandMessage(): string {
        if (this.cancelStack.length === 0) return '';
        const sortedPlacementCommand = this.getCommandStackInCommandOrder();
        const firstCommand = sortedPlacementCommand[0];

        const placementCase =
            firstCommand instanceof PlaceDraggedLetter === true
                ? this.numberToLetter((firstCommand as PlaceDraggedLetter).getPlaceInfo().indexes.y) +
                  (firstCommand as PlaceDraggedLetter).getPlaceInfo().indexes.x
                : this.firstSelectedCaseForPlacement;
        let commandMessage = `${PLACE_COMMAND} ${placementCase}${this.translateArrow(this.getPlacementArrowDirection())} `;

        if (!this.isCommandValid(sortedPlacementCommand)) return 'Placement invalide';
        for (const command of sortedPlacementCommand) {
            commandMessage += (command as PlaceLetter).getPlaceInfo().tile.content;
        }
        return commandMessage;
    }

    get lastPlacement(): PlaceLetter | null {
        if (this.cancelStack.length === 0) return null;
        return this.cancelStack[this.cancelStack.length - 1] as PlaceLetter;
    }

    get placementType(): PlacementType {
        if (this.cancelStack.length === 0) return PlacementType.None;
        if (this.cancelStack[0] instanceof PlaceDraggedLetter === true) return PlacementType.DragAndDrop;
        return PlacementType.Simple;
    }

    get placedLettersAmount(): number {
        return this.cancelStack.length;
    }

    get futurePlacementDirection(): string {
        if (this.isHorizontalPlacement()) return RIGHT_ARROW;
        if (this.isVerticalPlacement()) return DOWN_ARROW;
        return ANY_ARROW;
    }

    executeCommand(command: Command) {
        const tilePosition = { ...(command as PlaceLetter).tilePosition };
        command.execute();
        this.cancelStack.push(command);
        if (command instanceof PlaceLetter === false) return;

        this.selectedTile = (command as PlaceLetter).getNextPlaceInfo();

        if (this.canSelectFirstCaseForPlacement) {
            this.socketService.send(SocketEvent.FirstTilePlaced, tilePosition);
            this.canSelectFirstCaseForPlacement = false;
        }
    }

    cancel(isAfterPlacement?: boolean) {
        if (this.cancelStack.length <= 0) return;
        const placeLetterCommand = this.cancelStack[this.cancelStack.length - 1] as PlaceLetter;
        if (placeLetterCommand) {
            this.selectedTile = placeLetterCommand.getPlaceInfo();
        }
        const commandToCancel = this.cancelStack.pop();

        if (this.cancelStack.length <= 0) {
            this.canSelectFirstCaseForPlacement = true;
            this.selectedTile = undefined;
            if (!isAfterPlacement) this.socketService.send(SocketEvent.FirstTilePlaced, null);
        }

        commandToCancel?.cancel();
    }

    removeAllViewLetters(isAfterPlacement?: boolean) {
        while (this.cancelStack.length > 0) {
            this.cancel(isAfterPlacement);
        }
    }

    isCancelStackEmpty(): boolean {
        return this.cancelStack.length === 0;
    }

    cancelTilePlacementCommand(tile: Tile, isDragCancel?: boolean) {
        const commandToCancel = this.findCommandToCancel(tile);
        if (!commandToCancel) return;

        commandToCancel.forceCancel();

        const previousCommand = this.getPreviousCommand(commandToCancel);
        if (previousCommand && !isDragCancel) {
            previousCommand.decrementNextLetterPosition();
        }

        this.removeCommand(commandToCancel as Command);

        if (this.cancelStack.length === 1) {
            (this.cancelStack[0] as PlaceLetter).arrowDirection = ANY_ARROW;
        }

        if (this.cancelStack.length <= 0) {
            this.canSelectFirstCaseForPlacement = true;
        }
    }

    isHorizontalPlacement(): boolean {
        if (this.canSelectFirstCaseForPlacement) return false;
        if (this.lastPlacement?.arrowDirection !== ANY_ARROW && this.lastPlacement?.arrowDirection !== RIGHT_ARROW) return false;

        return this.selectedTile?.indexes.y === this.lastPlacement?.getPlaceInfo().indexes.y;
    }

    isVerticalPlacement(): boolean {
        if (this.canSelectFirstCaseForPlacement) return false;
        if (this.lastPlacement?.arrowDirection !== ANY_ARROW && this.lastPlacement?.arrowDirection !== DOWN_ARROW) return false;
        return this.selectedTile?.indexes.x === this.lastPlacement?.getPlaceInfo().indexes.x;
    }

    private getCommandStackInCommandOrder(): Command[] {
        let sortedStack = this.cancelStack;
        switch (this.getPlacementArrowDirection()) {
            case RIGHT_ARROW:
                sortedStack = this.cancelStack.sort((placeLetterA: Command, placeLetterB: Command) => {
                    return (placeLetterA as PlaceLetter).getPlaceInfo().indexes.x - (placeLetterB as PlaceLetter).getPlaceInfo().indexes.x;
                });
                break;
            case DOWN_ARROW:
                sortedStack = this.cancelStack.sort((placeLetterA: Command, placeLetterB: Command) => {
                    return (placeLetterA as PlaceLetter).getPlaceInfo().indexes.y - (placeLetterB as PlaceLetter).getPlaceInfo().indexes.y;
                });
                break;
            default:
                break;
        }
        return sortedStack;
    }

    private getPlacementArrowDirection(): string {
        for (const command of this.cancelStack) {
            if ((command as PlaceLetter).arrowDirection !== ANY_ARROW) return (command as PlaceLetter).arrowDirection;
        }
        return RIGHT_ARROW;
    }

    private isCommandValid(sortedCommandStack: Command[]): boolean {
        const firstCommand = (sortedCommandStack[0] as PlaceLetter).getPlaceInfo();
        const lastCommand = (sortedCommandStack[sortedCommandStack.length - 1] as PlaceLetter).getPlaceInfo();
        const finalBoardState = lastCommand.lettersInBoard;

        if ((sortedCommandStack[sortedCommandStack.length - 1] as PlaceLetter).arrowDirection === RIGHT_ARROW) {
            const lengthBetweenFirstAndLastCommand = lastCommand.indexes.x - firstCommand.indexes.x;
            for (let i = 0; i < lengthBetweenFirstAndLastCommand; i++) {
                if (finalBoardState[firstCommand.indexes.x + i][firstCommand.indexes.y].content === '') return false;
            }
        } else {
            const lengthBetweenFirstAndLastCommand = lastCommand.indexes.y - firstCommand.indexes.y;
            for (let i = 0; i < lengthBetweenFirstAndLastCommand; i++) {
                if (finalBoardState[firstCommand.indexes.x][firstCommand.indexes.y + i].content === '') return false;
            }
        }

        return true;
    }

    private numberToLetter(number: number): string {
        return String.fromCharCode(A_ASCII + number - 1);
    }

    private removeCommand(command: Command) {
        this.cancelStack.splice(this.cancelStack.indexOf(command), 1);
    }

    private getPreviousCommand(placeLetterCommand: PlaceLetter): PlaceLetter | undefined {
        for (let i = 0; i < this.cancelStack.length; i++) {
            if ((this.cancelStack[i] as PlaceLetter) === placeLetterCommand) {
                if (i === 0) return;
                return this.cancelStack[i - 1] as PlaceLetter;
            }
        }
        return;
    }

    private findCommandToCancel(tile: Tile): PlaceLetter {
        return this.cancelStack.find((command) => {
            const placementCommand = command as PlaceLetter;
            return placementCommand.getPlaceInfo().tile === tile;
        }) as PlaceLetter;
    }

    private translateArrow(arrow: string): string {
        if (arrow === DOWN_ARROW) return 'v';
        return 'h';
    }
}
