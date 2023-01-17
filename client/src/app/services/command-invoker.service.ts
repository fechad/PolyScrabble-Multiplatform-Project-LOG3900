import { Injectable } from '@angular/core';
import { Command } from '@app/classes/command/abstract-command';
import { PlaceLetter } from '@app/classes/command/place-letter';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Tile } from '@app/classes/tile';
import { DOWN_ARROW } from '@app/enums/tile-constants';

const PLACE_COMMAND = '!placer';
@Injectable({
    providedIn: 'root',
})
export class CommandInvokerService {
    canSelectFirstCaseForPlacement: boolean;
    firstSelectedCaseForPlacement: string;
    selectedTile: PlaceLetterInfo | undefined;

    private cancelStack: Command[];

    constructor() {
        this.cancelStack = [];
        this.canSelectFirstCaseForPlacement = true;
        this.firstSelectedCaseForPlacement = '';
    }

    get commandMessage(): string {
        if (this.cancelStack.length === 0) return '';
        let placeLetterCommand = this.cancelStack[this.cancelStack.length - 1] as PlaceLetter;
        let commandMessage = `${PLACE_COMMAND} ${this.firstSelectedCaseForPlacement}${this.translateArrow(placeLetterCommand.arrowDirection)} `;
        for (const command of this.cancelStack) {
            placeLetterCommand = command as PlaceLetter;
            commandMessage += placeLetterCommand.getPlaceInfo().tile.content;
        }
        return commandMessage;
    }

    executeCommand(command: Command) {
        command.execute();
        this.cancelStack.push(command);
        const placeLetterCommand = command as PlaceLetter;
        if (placeLetterCommand) {
            this.selectedTile = placeLetterCommand.getNextPlaceInfo();
        }

        this.canSelectFirstCaseForPlacement = false;
    }

    cancel() {
        if (this.cancelStack.length <= 0) return;
        const placeLetterCommand = this.cancelStack[this.cancelStack.length - 1] as PlaceLetter;
        if (placeLetterCommand) {
            this.selectedTile = placeLetterCommand.getPlaceInfo();
        }
        const commandToCancel = this.cancelStack.pop() as PlaceLetter;

        if (this.cancelStack.length <= 0) {
            commandToCancel.isFirstPlaced = true;
            this.canSelectFirstCaseForPlacement = true;
            this.selectedTile = undefined;
        }

        commandToCancel.cancel();
    }

    removeAllViewLetters() {
        while (this.cancelStack.length > 0) {
            this.cancel();
        }
    }

    isCancelStackEmpty(): boolean {
        return this.cancelStack.length === 0;
    }

    cancelTilePlacementCommand(tile: Tile) {
        const commandToCancel = this.findCommandToCancel(tile);
        if (!commandToCancel) return;

        commandToCancel.forceCancel();

        const previousCommand = this.getPreviousCommand(commandToCancel);
        if (previousCommand) {
            previousCommand.decrementNextLetterPosition();
        }

        this.removeCommand(commandToCancel as Command);

        if (this.cancelStack.length <= 0) {
            this.canSelectFirstCaseForPlacement = true;
        }
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
