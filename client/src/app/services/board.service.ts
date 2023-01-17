import { Injectable } from '@angular/core';
import { BoardMessage } from '@app/classes/board-message';
import { PlaceLetter } from '@app/classes/command/place-letter';
import { Dimension } from '@app/classes/dimension';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { PlacementCommand } from '@app/classes/placement-command';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import {
    DEFAULT_BOARD_BACKGROUND_COLOR,
    DEFAULT_BOARD_INDEXES_COLOR,
    DEFAULT_CASE_COUNT,
    DEFAULT_STARTING_POSITION,
} from '@app/constants/board-constants';
import { DEFAULT_TILE_COLOR } from '@app/constants/rack-constants';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { LetterTileService } from './letter-tile.service';
import { PlacementViewTilesService } from './placement-view-tiles.service';
import { SessionStorageService } from './session-storage.service';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private lettersInBoard: Tile[][];
    private placementCommands: PlacementCommand[];
    private tileDimension: Dimension;

    constructor(
        private placementViewTileService: PlacementViewTilesService,
        private letterTileService: LetterTileService,
        private sessionStorageService: SessionStorageService,
        private commandInvoker: CommandInvokerService,

        private readonly rack: Rack,
    ) {
        this.tileDimension = { width: 0, height: 0, letterRatio: 0 };
        this.placementCommands = [];
    }

    initializeBoardService(tileDimension: Dimension) {
        this.tileDimension = { ...tileDimension };
        this.reinitializeLettersTiles();
    }

    setupTileServicesContexts(letterTileServiceContext: CanvasRenderingContext2D, placementViewTileServiceContext: CanvasRenderingContext2D) {
        this.letterTileService.gridContext = letterTileServiceContext;
        this.placementViewTileService.gridContext = placementViewTileServiceContext;
    }

    mouseHitDetect(mousePosition: Position) {
        if (!this.canSelectCase(mousePosition)) return;

        this.handlePreviousTileOnMouseHitDetect();
        this.updateSelectedTileOnMouseHitDetect(mousePosition);

        if (!this.commandInvoker.selectedTile) return;
        if (this.commandInvoker.selectedTile.tile.content !== '' && !this.commandInvoker.selectedTile.tile.hasArrowAsContent()) {
            this.commandInvoker.selectedTile = undefined;
            return;
        }

        this.commandInvoker.selectedTile.tile.updateSelectionType(SelectionType.BOARD);
        this.placementViewTileService.drawArrow(this.commandInvoker.selectedTile.tile, this.tileDimension, this.letterRatio as number);
    }

    placeLetterInBoard(letter: string) {
        let transformedLetter = this.rack.transformSpecialChar(letter);
        if (!this.commandInvoker.selectedTile) return;
        if (!this.rack.rackWord.includes(transformedLetter) || transformedLetter === '' || transformedLetter === ' ') return;
        if (!this.commandInvoker.selectedTile.tile.hasArrowAsContent()) return;

        if (transformedLetter === '*') {
            transformedLetter = this.rack.transformSpecialChar(letter.toLowerCase()).toUpperCase();
        }

        this.commandInvoker.selectedTile.letter = transformedLetter;
        const placeLetterCommand = new PlaceLetter(
            this.placementViewTileService,
            this.commandInvoker.selectedTile,
            this.commandInvoker.selectedTile.tile.content,
            this.commandInvoker.canSelectFirstCaseForPlacement,
        );

        this.commandInvoker.executeCommand(placeLetterCommand);
    }

    removeAllViewLetters() {
        this.commandInvoker.removeAllViewLetters();
        if (!this.commandInvoker.selectedTile) return;
        this.commandInvoker.selectedTile.tile.content = '';
        this.commandInvoker.selectedTile.tile.updateSelectionType(SelectionType.UNSELECTED);
        this.placementViewTileService.removeLetterTile(this.commandInvoker.selectedTile.tile, {
            width: this.tileWidth,
            height: this.tileHeight,
            letterRatio: this.letterRatio,
        });
    }

    removePlacementCommands() {
        this.sessionStorageService.removeItem('placementCommands');
    }

    drawWord(word: string, xStartingPosition: number, yStartingPosition: number, direction?: string) {
        if (this.placementValidation(word, xStartingPosition, yStartingPosition, direction) !== undefined) return;

        const position: Position = { x: xStartingPosition, y: yStartingPosition };
        for (const letter of word) {
            this.handleLetterInCurrentPosition(letter, position, direction as string);
            this.drawLetterOnDrawWord(letter, position, direction as string);
        }

        const startingPosition = { x: xStartingPosition, y: yStartingPosition };
        this.addPlacementCommand(word, startingPosition, direction as string);
    }

    redrawLettersTile() {
        const placementCommandsHistory = this.sessionStorageService.getPlacementCommands('placementCommands');
        this.sessionStorageService.setItem('placementCommands', JSON.stringify([]));
        this.placementCommands = [];
        for (const placementCommand of placementCommandsHistory) {
            this.drawWord(placementCommand.word, placementCommand.xPosition, placementCommand.yPosition, placementCommand.direction);
        }
    }

    reinitializeLettersTiles() {
        this.lettersInBoard = new Array<Tile[]>(DEFAULT_CASE_COUNT);
        this.setUpTiles(this.lettersInBoard);
    }

    canBeFocused(position: Position): boolean {
        const caseIndexes = this.getCaseIndex(position);
        if (this.isFirstRowOrColumn(position)) return false;
        if (this.lettersInBoard[caseIndexes.x][caseIndexes.y].content !== '') return false;
        return true;
    }

    private get tileWidth() {
        return this.tileDimension.width;
    }

    private get tileHeight() {
        return this.tileDimension.height;
    }

    private get letterRatio() {
        return this.tileDimension.letterRatio;
    }

    private canSelectCase(mousePosition: Position): boolean {
        if (!this.commandInvoker.canSelectFirstCaseForPlacement || this.isFirstRowOrColumn(mousePosition)) return false;
        return true;
    }
    private handleLetterInCurrentPosition(letter: string, position: Position, direction: string) {
        while (this.lettersInBoard[position.x][position.y].content !== '') {
            if (this.lettersInBoard[position.x][position.y].typeOfSelection === SelectionType.BOARD) {
                this.lettersInBoard[position.x][position.y].content = letter;
                this.commandInvoker.cancelTilePlacementCommand(this.lettersInBoard[position.x][position.y]);
                if (!this.commandInvoker.isCancelStackEmpty()) break;
                this.removeAllViewLetters();
                break;
            }
            this.updatePosition(direction as string, position);
        }
    }

    private drawLetterOnDrawWord(letter: string, position: Position, direction: string) {
        this.lettersInBoard[position.x][position.y].content = letter;
        this.lettersInBoard[position.x][position.y].updateSelectionType(SelectionType.UNSELECTED);
        this.drawLetterTile(this.lettersInBoard[position.x][position.y]);
        this.updatePosition(direction as string, position);
    }

    private drawLetterTile(letterTile: Tile) {
        if (letterTile.content === '') return;
        letterTile.color = DEFAULT_TILE_COLOR;
        letterTile.points = this.letterTileService.tileScore(letterTile.content as string);
        this.letterTileService.drawLetterTile(letterTile, { width: this.tileWidth, height: this.tileHeight }, this.letterRatio as number);
    }

    private isFirstRowOrColumn(position: Position): boolean {
        const caseIndexes = this.getCaseIndex(position);
        if (caseIndexes.x === 0 || caseIndexes.y === 0) return true;
        return false;
    }

    private handlePreviousTileOnMouseHitDetect() {
        const previousTile = this.commandInvoker.selectedTile;
        if (previousTile) {
            this.placementViewTileService.removeLetterTile(previousTile.tile, {
                width: this.tileWidth,
                height: this.tileHeight,
                letterRatio: this.letterRatio,
            });
        }
    }

    private updateSelectedTileOnMouseHitDetect(mousePosition: Position) {
        const previousTile = this.commandInvoker.selectedTile;
        this.commandInvoker.selectedTile = this.getSelectedTile(mousePosition);
        if (previousTile && previousTile.tile !== this.commandInvoker.selectedTile?.tile) {
            previousTile.tile.content = '';
        }
    }

    private getSelectedTile(mousePosition: Position): PlaceLetterInfo {
        const caseIndex = this.getCaseIndex(mousePosition);
        if (this.commandInvoker.canSelectFirstCaseForPlacement) {
            this.commandInvoker.firstSelectedCaseForPlacement = '' + this.letterTileService.numberToLetter(caseIndex.y) + caseIndex.x;
        }

        return {
            lettersInBoard: this.lettersInBoard,
            rack: this.rack,
            letter: '',
            dimension: {
                width: this.tileWidth,
                height: this.tileHeight,
                letterRatio: this.letterRatio,
            },
            tile: this.lettersInBoard[caseIndex.x][caseIndex.y],
            indexes: caseIndex,
        };
    }

    private getCaseIndex(position: Position): Position {
        return { x: parseInt('' + position.x / this.tileWidth, 10), y: parseInt('' + position.y / this.tileHeight, 10) };
    }

    private updatePosition(direction: string, position: Position) {
        if (direction === Direction.Horizontal) {
            position.x += 1;
            return;
        }
        position.y += 1;
    }

    private placementValidation(word: string, xPosition: number, yPosition: number, direction?: string): BoardMessage | void {
        if (direction === undefined || direction === '') return new BoardMessage('Invalid placement', 'No direction provided');
        if (xPosition < 0 || yPosition < 0) return new BoardMessage('Invalid placement', 'Invalid row/column');
        if (word.length < 1) return new BoardMessage('Invalid word', 'Empty word provided');
        if (xPosition >= DEFAULT_CASE_COUNT || yPosition >= DEFAULT_CASE_COUNT) return new BoardMessage('Invalid placement', 'Invalid row/column');
        return;
    }

    private addPlacementCommand(word: string, startingPosition: Position, direction: string) {
        this.placementCommands.push({ word, xPosition: startingPosition.x, yPosition: startingPosition.y, direction });
        this.sessionStorageService.setItem('placementCommands', JSON.stringify(this.placementCommands));
    }

    private setUpTiles(tilesArray: Tile[][]) {
        this.initializeColumnIndex(tilesArray);

        const tilePosition: Position = { x: DEFAULT_STARTING_POSITION, y: DEFAULT_STARTING_POSITION + this.tileHeight };
        const tileDimension: Dimension = { width: this.tileWidth, height: this.tileHeight };
        for (let i = DEFAULT_STARTING_POSITION; i < DEFAULT_CASE_COUNT; i++) {
            for (let j = DEFAULT_STARTING_POSITION + 1; j < DEFAULT_CASE_COUNT; j++) {
                tilesArray[i][j] = new Tile();
                tilesArray[i][j].setDefaultValues(tilePosition, tileDimension, '', DEFAULT_BOARD_BACKGROUND_COLOR);
                tilePosition.y += this.tileHeight;
            }
            tilePosition.y = this.tileHeight;
            tilePosition.x += this.tileWidth;
        }
    }
    private initializeColumnIndex(tileBoard: Tile[][]) {
        let xPosition = DEFAULT_STARTING_POSITION;
        let content = '';
        const tileDimension: Dimension = { width: this.tileWidth, height: this.tileHeight };
        for (let j = DEFAULT_STARTING_POSITION; j < DEFAULT_CASE_COUNT; j++) {
            const row = new Array<Tile>(DEFAULT_CASE_COUNT);
            row[0] = new Tile();
            row[0].setDefaultValues({ x: xPosition, y: DEFAULT_STARTING_POSITION }, tileDimension, content, DEFAULT_BOARD_INDEXES_COLOR);
            xPosition += this.tileWidth;
            tileBoard[j] = row;
            content = '' + (j + 1);
        }
    }
}
