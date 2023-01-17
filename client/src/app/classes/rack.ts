import { Injectable } from '@angular/core';
import { Position } from '@app/classes/position';
import { DEFAULT_STARTING_POSITION } from '@app/constants/board-constants';
import { DEFAULT_TILE_COLOR, DEFAULT_TILE_HEIGHT, DEFAULT_TILE_WIDTH, ERROR, RACK_CAPACITY, RACK_SCALING_RATIO } from '@app/constants/rack-constants';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { LetterTileService } from '@app/services/letter-tile.service';
import { RackGridService } from '@app/services/rack-grid.service';
import { Tile } from './tile';

const RACK_START_Y_AXIS = 10;
const SPECIAL_U = 'ûù';
const SPECIAL_O = 'ô';
const SPECIAL_E = 'éèê';
const SPECIAL_A = 'àâ';
const SPECIAL_I = 'î';
const SPECIAL_C = 'ç';
const BLANK_TILE = ' ';
@Injectable({
    providedIn: 'root',
})
export class Rack {
    private currentSelectionType: SelectionType;
    private selectedTileIndex: number;
    private rack: Tile[];
    constructor(public letterTileService: LetterTileService, public rackGridService: RackGridService) {
        this.currentSelectionType = SelectionType.UNSELECTED;
        this.rack = new Array<Tile>(RACK_CAPACITY);
        this.selectedTileIndex = ERROR;
        this.updateRack('');
    }

    get rackWord(): string {
        let word = '';
        for (const tile of this.rack) {
            word += tile.content;
        }
        word.padEnd(RACK_CAPACITY, BLANK_TILE);
        return word;
    }

    updateRack(word: string) {
        let letterOffsetPosition = DEFAULT_STARTING_POSITION;
        for (let i = 0; i < RACK_CAPACITY; i++) {
            const tile = new Tile();
            tile.setDefaultValues(
                { x: letterOffsetPosition, y: RACK_START_Y_AXIS },
                { width: DEFAULT_TILE_WIDTH, height: DEFAULT_TILE_HEIGHT },
                word[i],
                DEFAULT_TILE_COLOR,
                this.letterTileService.tileScore(word[i] as string),
            );
            this.rack[i] = tile;
            letterOffsetPosition += DEFAULT_TILE_WIDTH;
        }
        this.drawRackContent();
    }

    mouseHitDetect(event: MouseEvent) {
        this.updateSelectionType(SelectionType.UNSELECTED);

        if (!this.getTileClickedOn({ x: event.offsetX, y: event.offsetY })) {
            this.selectedTileIndex = ERROR;
            return;
        }

        this.selectTileForPlacement(this.getTileClickedOn({ x: event.offsetX, y: event.offsetY }) as Tile);
        this.setCaseSelectedIndex({ x: event.offsetX, y: event.offsetY });
    }

    selectLetterTile(letter: string) {
        this.updateSelectionType(SelectionType.UNSELECTED);
        // === undefined because it will return false if it is === to 0
        if (this.selectedTileIndex === undefined) return;
        const letterIndexes: number[] = this.findAllLetterInstances(letter);
        if (letterIndexes.length === 0) {
            this.selectedTileIndex = ERROR;
            return;
        }

        if (this.isLastOrInvalidSelectedLetter(letterIndexes) || this.isAnotherLetterSelected(letterIndexes)) {
            this.selectFirstInstanceOfLetter(letterIndexes);
        } else {
            this.selectNextInstanceOfSameLetter(letterIndexes);
        }

        this.selectTileForPlacement(this.rack[this.selectedTileIndex]);
    }

    findAllLetterInstances(letter: string): number[] {
        const indexes = new Array<number>();
        for (let i = 0; i < this.rack.length; i++) {
            if (letter === this.rack[i].content) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    removeLetter(letter: string) {
        if (!this.rackWord.includes(letter)) return;

        const index = this.rackWord.indexOf(letter);
        this.rack[index].content = BLANK_TILE;
        this.rack[index].points = ERROR;
        this.drawRackContent();
    }

    addLetter(letter: string) {
        for (const tile of this.rack) {
            if (tile.content !== BLANK_TILE) continue;
            tile.content = letter;
            break;
        }
        this.updateRack(this.rackWord);
    }

    moveTile(direction: Direction) {
        if (!this.isIndexValid(this.selectedTileIndex)) return;
        let indexToSwap: number;
        switch (direction) {
            case Direction.Right:
                indexToSwap = (this.selectedTileIndex + 1) % RACK_CAPACITY;
                break;
            case Direction.Left:
                indexToSwap = this.selectedTileIndex - 1;
                if (indexToSwap === ERROR) {
                    indexToSwap = RACK_CAPACITY - 1;
                }
                break;
            default:
                indexToSwap = ERROR;
                break;
        }
        if (!this.canSwap(this.selectedTileIndex, indexToSwap)) return;

        this.swapTile(this.selectedTileIndex, indexToSwap);
        this.updateRack(this.rackWord);

        this.selectedTileIndex = indexToSwap;
        this.selectTileForPlacement(this.rack[indexToSwap]);
    }

    cancelExchange() {
        for (const tile of this.rack) {
            tile.updateSelectionType(SelectionType.UNSELECTED);
            this.rackGridService.drawBorder(tile);
        }
        this.currentSelectionType = SelectionType.UNSELECTED;
    }

    areTilesSelectedForExchange(): boolean {
        return this.currentSelectionType === SelectionType.EXCHANGE;
    }

    getSelectedLettersForExchange(): string {
        let letters = '';
        for (const tile of this.rack) {
            if (this.isTileSelectedForExchange(tile) && tile.content) {
                letters += tile.content;
            }
        }
        return letters;
    }

    onRightClick(clickX: number, clickY: number) {
        this.deselectLetterForManipulation();
        const tile = this.getTileClickedOn({ x: clickX, y: clickY });
        if (!tile) return;
        this.selectTileForExchange(tile);
    }

    transformSpecialChar(letter: string): string {
        if (letter.length !== 1 || letter === undefined) {
            return '';
        }
        const letterToTest = letter.toLowerCase();
        if (letter !== letterToTest) {
            return '*';
        }
        if (SPECIAL_U.includes(letterToTest)) {
            return 'u';
        }
        if (SPECIAL_O.includes(letterToTest)) {
            return 'o';
        }
        if (SPECIAL_A.includes(letterToTest)) {
            return 'a';
        }
        if (SPECIAL_I.includes(letterToTest)) {
            return 'i';
        }
        if (SPECIAL_E.includes(letterToTest)) {
            return 'e';
        }
        if (SPECIAL_C.includes(letterToTest)) {
            return 'c';
        }
        return letterToTest;
    }

    private deselectLetterForManipulation() {
        this.selectedTileIndex = ERROR;
    }
    private getTileClickedOn(position: Position): Tile | undefined {
        for (const tile of this.rack) {
            if (tile.contains(position)) {
                return tile;
            }
        }
        return undefined;
    }
    private drawRackTile(letterIndex: number) {
        this.rackGridService.drawLetterTile(this.rack[letterIndex], { width: DEFAULT_TILE_WIDTH, height: DEFAULT_TILE_HEIGHT }, RACK_SCALING_RATIO);
    }
    private drawRackContent() {
        for (let i = 0; i < RACK_CAPACITY; i++) {
            this.drawRackTile(i);
        }
    }
    private selectFirstInstanceOfLetter(letterIndexes: number[]) {
        this.selectedTileIndex = letterIndexes[0];
    }
    private selectNextInstanceOfSameLetter(letterIndexes: number[]) {
        const updatedIndexes = letterIndexes.filter((index) => index > this.selectedTileIndex);
        this.selectedTileIndex = updatedIndexes[0];
    }
    private selectTileForExchange(tile: Tile) {
        if (!tile) return;
        const selection = this.isTileSelectedForExchange(tile) ? SelectionType.UNSELECTED : SelectionType.EXCHANGE;
        tile.updateSelectionType(selection);
        this.rackGridService.drawBorder(tile);
        this.updateSelectionType(SelectionType.EXCHANGE);
    }
    private isLastOrInvalidSelectedLetter(letterIndexes: number[]): boolean {
        if (this.selectedTileIndex === letterIndexes[letterIndexes.length - 1] || this.selectedTileIndex === ERROR) return true;
        return false;
    }
    private isAnotherLetterSelected(letterIndexes: number[]): boolean {
        if (this.rack[this.selectedTileIndex].content !== this.rack[letterIndexes[0]].content) return true;
        return false;
    }
    private setCaseSelectedIndex(mousePosition: Position) {
        this.selectedTileIndex = parseInt('' + mousePosition.x / DEFAULT_TILE_WIDTH, 10);
    }
    private isTileSelectedForExchange(tile: Tile) {
        if (!tile) return;
        return tile.typeOfSelection === SelectionType.EXCHANGE;
    }
    private isIndexValid(index: number) {
        if (index < 0 || index >= RACK_CAPACITY) return false;
        return true;
    }
    private swapTile(firstTileIndex: number, secondTileIndex: number) {
        if (!this.canSwap(firstTileIndex, secondTileIndex)) return;

        const tempTile = this.rack[firstTileIndex];
        this.rack[firstTileIndex] = this.rack[secondTileIndex];
        this.rack[secondTileIndex] = tempTile;
    }
    private canSwap(firstTileIndex: number, secondTileIndex: number): boolean {
        if (firstTileIndex < 0 || secondTileIndex < 0) return false;
        if (firstTileIndex >= RACK_CAPACITY || secondTileIndex >= RACK_CAPACITY) return false;
        return true;
    }

    private selectTileForPlacement(tile: Tile) {
        if (!tile) return;
        const selection = this.isTileSelectedForPlacement(tile) ? SelectionType.UNSELECTED : SelectionType.PLACEMENT;
        tile.updateSelectionType(selection);
        this.rackGridService.drawBorder(tile);
        this.updateSelectionType(SelectionType.PLACEMENT);
    }

    private updateSelectionType(selection: SelectionType) {
        let allTilesAreUnselected = true;
        for (const tile of this.rack) {
            if (tile.typeOfSelection !== selection) {
                tile.updateSelectionType(SelectionType.UNSELECTED);
                this.rackGridService.drawBorder(tile);
            } else {
                allTilesAreUnselected = false;
            }
        }
        this.currentSelectionType = allTilesAreUnselected ? SelectionType.UNSELECTED : selection;
    }
    private isTileSelectedForPlacement(tile: Tile) {
        if (!tile) return;
        return tile.typeOfSelection === SelectionType.PLACEMENT;
    }
}
