/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoardMessage } from '@app/classes/board-message';
import { PlaceDraggedLetter } from '@app/classes/command/place-dragged-letter';
import { PlaceLetter } from '@app/classes/command/place-letter';
import { Dimension } from '@app/classes/dimension';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { TileChoicePopupComponent } from '@app/components/tile-choice-popup/tile-choice-popup.component';
import {
    DEFAULT_BOARD_BACKGROUND_COLOR,
    DEFAULT_BOARD_INDEXES_COLOR,
    DEFAULT_CASE_COUNT,
    DEFAULT_ROWS,
    // eslint-disable-next-line prettier/prettier
    DEFAULT_STARTING_POSITION,
} from '@app/constants/board-constants';
import { A_ASCII } from '@app/constants/constants';
import { DEFAULT_TILE_COLOR, POINTS } from '@app/constants/rack-constants';
import { Direction } from '@app/enums/direction';
import { PlacementType } from '@app/enums/placement-type';
import { SelectionType } from '@app/enums/selection-type';
import { ANY_ARROW, DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { SessionStorageService } from './session-storage.service';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    lettersInBoard: Tile[][];
    selectedTileForManipulation: Tile | null;
    isDraggingATile: boolean;
    private tileDimension: Dimension;

    constructor(
        private sessionStorageService: SessionStorageService,
        private commandInvoker: CommandInvokerService,
        private dialog: MatDialog,

        private readonly rack: Rack,
    ) {
        this.selectedTileForManipulation = null;
        this.isDraggingATile = false;
        this.tileDimension = { width: 0, height: 0, letterRatio: 0 };
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

    endTileDragging() {
        const buffer = 50;
        setTimeout(() => {
            this.isDraggingATile = false;
            this.selectedTileForManipulation = null;
        }, buffer);
    }

    selectTileForManipulation(tile: Tile) {
        if (!this.canDragTile(tile)) return;
        this.isDraggingATile = true;
        this.selectedTileForManipulation = tile;
    }

    removeManipulatedTile() {
        if (!this.selectedTileForManipulation) return;
        this.commandInvoker.cancelTilePlacementCommand(this.selectedTileForManipulation, true);
    }

    initializeBoardService(tileDimension: Dimension) {
        this.tileDimension = { ...tileDimension };
        this.reinitializeLettersTiles();
    }

    mouseHitDetect(tileIndexes: Position, isOtherPlayerPreview?: boolean) {
        if (this.commandInvoker.placementType !== PlacementType.Simple && this.commandInvoker.placementType !== PlacementType.None) return;
        if (!this.canSelectCase(tileIndexes)) return;

        this.updateSelectedTileOnMouseHitDetect(tileIndexes);

        if (!this.commandInvoker.selectedTile) return;
        if (this.commandInvoker.selectedTile.tile.content !== '' && !this.commandInvoker.selectedTile.tile.hasArrowAsContent()) {
            this.commandInvoker.selectedTile = undefined;
            return;
        }
        this.commandInvoker.selectedTile.tile.updateSelectionType(isOtherPlayerPreview ? SelectionType.PREVIEW : SelectionType.BOARD);
    }

    dragEndDetect(tileIndexes: Position) {
        if (!this.canEndTileDrag(tileIndexes)) return;

        this.updateSelectedTileOnMouseHitDetect(tileIndexes);
        if (!this.commandInvoker.selectedTile) return;

        if (this.commandInvoker.selectedTile.tile.content !== '' && !this.commandInvoker.selectedTile.tile.hasArrowAsContent()) {
            this.commandInvoker.selectedTile = undefined;
            return;
        }

        if (this.commandInvoker.canSelectFirstCaseForPlacement) {
            if (!this.rack.selectedTile) return;
            this.placeLetterInBoard(this.rack.selectedTile.content, true, this.commandInvoker.lastPlacement?.arrowDirection || ANY_ARROW);
            return;
        }

        if (this.isDraggingATile && this.commandInvoker.placedLettersAmount <= 1) {
            this.moveLetterInBoard(ANY_ARROW);
            return;
        }

        if (this.commandInvoker.isHorizontalPlacement() || this.commandInvoker.isVerticalPlacement()) {
            if (this.isDraggingATile) {
                this.moveLetterInBoard(this.commandInvoker.futurePlacementDirection);
                return;
            }
            if (!this.rack.selectedTile) return;
            this.placeLetterInBoard(this.rack.selectedTile.content, true, this.commandInvoker.futurePlacementDirection);
        }
    }

    placeLetterInBoard(letter: string, isDragPlacement?: boolean, direction?: string) {
        let transformedLetter = this.rack.transformSpecialChar(letter);
        if (!this.commandInvoker.selectedTile) return;
        if (!this.rack.rackWord.includes(transformedLetter) || transformedLetter === '' || transformedLetter === ' ') return;
        if (!isDragPlacement && !this.commandInvoker.selectedTile.tile.hasArrowAsContent()) return;

        if (transformedLetter === '*') {
            transformedLetter = this.rack.transformSpecialChar(letter.toLowerCase()).toUpperCase();
        }

        this.commandInvoker.selectedTile.letter = transformedLetter;
        const placementType = this.commandInvoker.placementType;

        if (!isDragPlacement && (placementType === PlacementType.Simple || placementType === PlacementType.None)) {
            const placeLetterCommand = new PlaceLetter(
                this.commandInvoker.selectedTile,
                this.commandInvoker.selectedTile.tile.content,
                this.commandInvoker.canSelectFirstCaseForPlacement,
            );
            this.commandInvoker.executeCommand(placeLetterCommand);
            return;
        }

        if (placementType !== PlacementType.DragAndDrop && placementType !== PlacementType.None) return;
        this.handleDraggedPlacement(direction);
    }

    moveLetterInBoard(direction: string) {
        if (!this.selectedTileForManipulation) return;
        const transformedLetter = this.rack.transformSpecialChar(this.selectedTileForManipulation?.content);

        if (!this.commandInvoker.selectedTile) return;
        this.commandInvoker.selectedTile.letter = transformedLetter;

        const placementType = this.commandInvoker.placementType;
        if (placementType !== PlacementType.DragAndDrop && placementType !== PlacementType.None) return;

        this.removeManipulatedTile();
        this.handleDraggedPlacement(direction);
    }

    handleDraggedPlacement(direction?: string) {
        if (!this.commandInvoker.selectedTile) return;
        if (this.commandInvoker.selectedTile.letter === '*') {
            this.handleDraggedStarPlacement(direction);
            return;
        }

        const placeDraggedLetterCommand = new PlaceDraggedLetter(
            this.commandInvoker.selectedTile,
            direction || ANY_ARROW,
            this.commandInvoker.canSelectFirstCaseForPlacement,
        );
        this.commandInvoker.executeCommand(placeDraggedLetterCommand);
    }

    handleDraggedStarPlacement(direction?: string) {
        const dialogWidth = '450px';
        const dialog = this.dialog.open(TileChoicePopupComponent, {
            width: dialogWidth,
            autoFocus: true,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) {
                return;
            }
            if (!this.commandInvoker.selectedTile) return;
            this.commandInvoker.selectedTile.letter = result;
            const placeDraggedStarCommand = new PlaceDraggedLetter(
                this.commandInvoker.selectedTile,
                direction || ANY_ARROW,
                this.commandInvoker.canSelectFirstCaseForPlacement,
            );
            this.commandInvoker.executeCommand(placeDraggedStarCommand);
        });
    }

    removeAllViewLetters(isAfterPlacement?: boolean) {
        this.commandInvoker.removeAllViewLetters(isAfterPlacement);
        if (!this.commandInvoker.selectedTile) return;
        this.commandInvoker.selectedTile.tile.content = '';
        this.commandInvoker.selectedTile.tile.updateSelectionType(SelectionType.UNSELECTED);
        this.commandInvoker.selectedTile = undefined;
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

    redrawLettersTile(placementsData: PlacementData[]) {
        for (const placementData of placementsData) {
            const rowNumber = this.matchRowNumber(placementData.row) as number;
            this.drawWord(placementData.word, parseInt(placementData.column, 10), rowNumber, placementData.direction);
        }
    }

    reinitializeLettersTiles() {
        this.lettersInBoard = new Array<Tile[]>(DEFAULT_CASE_COUNT);
        this.setUpTiles(this.lettersInBoard);
    }

    canBeFocused(tileIndexes: Position): boolean {
        if (this.isFirstRowOrColumn(tileIndexes)) return false;
        if (this.lettersInBoard[tileIndexes.x][tileIndexes.y].content !== '') return false;
        return true;
    }

    matchRowNumber(row: string): number | void {
        for (let i = 1; i < DEFAULT_CASE_COUNT; i++) {
            if (row === DEFAULT_ROWS[i]) {
                return i;
            }
        }
        return;
    }

    // We keep this method just for the placementCommands tests
    // eslint-disable-next-line no-unused-vars
    private addPlacementCommand(word: string, startingPosition: Position, direction: string) {
        return;
    }

    private canDragTile(tile: Tile): boolean {
        return (
            tile.content !== '' && tile.content !== RIGHT_ARROW && tile.content !== DOWN_ARROW && tile.typeOfSelection !== SelectionType.UNSELECTED
        );
    }

    private canEndTileDrag(tileIndexes: Position): boolean {
        if (this.commandInvoker.placementType !== PlacementType.DragAndDrop && this.commandInvoker.placementType !== PlacementType.None) return false;
        if (this.isFirstRowOrColumn(tileIndexes)) return false;
        return true;
    }

    private canSelectCase(tileIndexes: Position): boolean {
        if (!this.commandInvoker.canSelectFirstCaseForPlacement || this.isFirstRowOrColumn(tileIndexes)) return false;
        return true;
    }
    private handleLetterInCurrentPosition(letter: string, position: Position, direction: string) {
        if (!this.lettersInBoard[position.x] || !this.lettersInBoard[position.x][position.y]) return;
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
        letterTile.points = this.tileScore(letterTile.content as string);
    }

    // TODO: put this duplicated method somewhere that it makes sense
    private tileScore(letter: string): number {
        if (letter === '' || letter === undefined || letter === '*') return 0;
        const normalLetter = letter;
        if (normalLetter.toLowerCase() !== normalLetter) return 0;
        return POINTS[letter.charCodeAt(0) - A_ASCII];
    }

    private isFirstRowOrColumn(tileIndexes: Position): boolean {
        if (tileIndexes.x === 0 || tileIndexes.y === 0) return true;
        return false;
    }

    private updateSelectedTileOnMouseHitDetect(tileIndexes: Position) {
        const previousTile = this.commandInvoker.selectedTile;
        this.commandInvoker.selectedTile = this.getSelectedTile(tileIndexes);
        if (previousTile && previousTile.tile !== this.commandInvoker.selectedTile?.tile) {
            previousTile.tile.content = '';
        }
    }

    private getSelectedTile(tileIndexes: Position): PlaceLetterInfo {
        if (this.commandInvoker.canSelectFirstCaseForPlacement) {
            this.commandInvoker.firstSelectedCaseForPlacement = '' + this.numberToLetter(tileIndexes.y) + tileIndexes.x;
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
            tile: this.lettersInBoard[tileIndexes.x][tileIndexes.y],
            indexes: tileIndexes,
        };
    }

    private numberToLetter(number: number): string {
        return String.fromCharCode(A_ASCII + number - 1);
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
