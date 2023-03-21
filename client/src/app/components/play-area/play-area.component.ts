/* eslint-disable max-lines */
import { Component, EventEmitter, HostListener, OnChanges, OnInit, Output } from '@angular/core';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { Dimension } from '@app/classes/dimension';
import { KeyboardKeys } from '@app/classes/keyboard-keys';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room';
import { Tile } from '@app/classes/tile';
import {
    BOARD_SCALING_RATIO,
    DEFAULT_BOARD_BACKGROUND_COLOR,
    DEFAULT_BOARD_BORDER_COLOR,
    DEFAULT_BOARD_INDEXES_COLOR,
    DEFAULT_BOARD_LINE_WIDTH,
    DEFAULT_CASE_COUNT,
    DEFAULT_HEIGHT,
    DEFAULT_INDEX_COLOR,
    DEFAULT_ROWS,
    DEFAULT_STARTING_POSITION,
    DEFAULT_WIDTH,
    specialCases,
} from '@app/constants/board-constants';
import { ONE_SECOND_IN_MS } from '@app/constants/constants';
import { SelectionType } from '@app/enums/selection-type';
import { SocketEvent } from '@app/enums/socket-event';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { BoardService } from '@app/services/board.service';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent extends ComponentCommunicationManager implements OnInit, OnChanges {
    @Output() hintValueEvent = new EventEmitter<number>();
    letterRatio: number;
    isBoardReady: boolean;
    currentHint: number;
    hints: string;
    protected board: Tile[][];
    private ratioSize: number;
    private canvasSize: Position;

    constructor(
        protected socketService: SocketClientService,
        protected rack: Rack,
        private commandInvoker: CommandInvokerService,
        protected boardService: BoardService,
        private focusHandlerService: FocusHandlerService,
        private playerService: PlayerService,
    ) {
        super(socketService);
        this.currentHint = 0;
        this.isBoardReady = false;
        this.ratioSize = 1;
        this.letterRatio = BOARD_SCALING_RATIO;

        this.board = new Array<Tile[]>(DEFAULT_CASE_COUNT);

        this.buildBoardArray();

        this.boardService.initializeBoardService({ width: this.tileWidth, height: this.tileHeight, letterRatio: this.letterRatio });

        const buffer = 50;
        setTimeout(() => {
            this.isBoardReady = true;
        }, buffer);
    }

    get selectionType(): typeof SelectionType {
        return SelectionType;
    }

    get room(): Room {
        return this.playerService.room;
    }

    get width(): number {
        return this.canvasSize.x;
    }
    get height(): number {
        return this.canvasSize.y;
    }

    get isActivePlayer(): boolean {
        return this.playerService.player.isItsTurn;
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    private get tileWidth(): number {
        return (this.width * this.ratioSize) / DEFAULT_CASE_COUNT;
    }

    private get tileHeight(): number {
        return (this.height * this.ratioSize) / DEFAULT_CASE_COUNT;
    }

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        switch (event.key) {
            case KeyboardKeys.Enter:
                this.confirmPlacement();
                this.boardService.removeAllViewLetters();
                break;
            case KeyboardKeys.Backspace:
                this.commandInvoker.cancel();
                break;
            case KeyboardKeys.Esc:
                this.cancelPlacement();
                break;
            default:
                this.boardService.placeLetterInBoard(event.key);
                break;
        }
    }

    canShowPoint(tile: Tile) {
        return tile.content && tile.content !== RIGHT_ARROW && tile.content !== DOWN_ARROW;
    }

    // TODO: add this on mouseOver Event for firefox navigator
    onMouseOver(container: HTMLDivElement) {
        if (this.rack.isDraggingATile) {
            container.dispatchEvent(new Event('mouseup'));
        }
    }

    dragEnd(tileIndexes: Position) {
        if (!this.playerService.player.isItsTurn) return;
        if (this.rack.isDraggingATile) {
            this.boardService.dragEndDetect(tileIndexes);
            this.rack.isDraggingATile = false;
        } else if (this.boardService.isDraggingATile) {
            this.boardService.dragEndDetect(tileIndexes);
        }
    }

    mouseHitDetect(mouseEvent: MouseEvent, tileIndexes: Position) {
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        if (!this.playerService.player.isItsTurn) return;
        this.updateFocus(mouseEvent, tileIndexes);
        if (this.focusHandlerService.currentFocus.value !== CurrentFocus.BOARD) return;
        this.boardService.mouseHitDetect(tileIndexes);
    }

    ngOnInit() {
        this.connectSocket();
        // this.focusHandlerService.currentFocus.subscribe(() => {
        //     if (!this.focusHandlerService.isCurrentFocus(CurrentFocus.BOARD)) {
        //         this.boardService.removeAllViewLetters();
        //     }
        // });
        this.focusHandlerService.showHint.subscribe((hint: string) => {
            if (hint === 'ERROR' || this.room.elapsedTime < 1) return;
            this.hints = hint;
            this.showHint();
        });
        this.drawBoard();
    }

    ngOnChanges() {
        this.buildBoardArray();
    }

    changePlayerTurn() {
        this.socketService.send(SocketEvent.Message, '!passer');
    }

    confirmPlacement() {
        if (this.commandInvoker.commandMessage.length === 0) return;
        this.focusHandlerService.clientChatMessage.next(this.commandInvoker.commandMessage);
        this.socketService.send(SocketEvent.Message, this.commandInvoker.commandMessage);
        this.handleGoodPlacement();
        this.handleBadPlacement();
    }

    editLetterSize() {
        this.drawBoard();

        this.boardService.reinitializeLettersTiles();
        this.boardService.redrawLettersTile();
    }

    isPlayerTurn(): boolean {
        return this.playerService.player.isItsTurn;
    }

    showHint() {
        if (!this.hints) return;
        this.boardService.removeAllViewLetters();
        const shiftToNumber = 96;
        const hint = this.hints.split('-');

        const orientation = hint[0][hint[0].length - 1];
        const row = hint[0][0].charCodeAt(0) - shiftToNumber;
        const col = parseInt(hint[0].slice(1, hint[0].length - 1), 10);
        this.boardService.mouseHitDetect({ x: col, y: row } as Position);
        if (orientation === 'h') for (const letter of hint[1].split('')) this.boardService.placeLetterInBoard(letter, false, RIGHT_ARROW);
        else {
            this.boardService.mouseHitDetect({ x: col, y: row } as Position);
            for (const letter of hint[1].split('')) this.boardService.placeLetterInBoard(letter, false, DOWN_ARROW);
        }
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.DrawBoard, (placementData: PlacementData) => {
            const rowNumber = this.matchRowNumber(placementData.row) as number;
            this.boardService.drawWord(placementData.word, parseInt(placementData.column, 10), rowNumber, placementData.direction);
        });
    }

    protected onFirstSocketConnection() {
        this.boardService.removePlacementCommands();
    }

    protected onRefresh() {
        this.boardService.redrawLettersTile();
    }

    private cancelPlacement() {
        this.focusHandlerService.currentFocus.next(CurrentFocus.RACK);
    }

    private drawBoard() {
        this.drawSpecialTiles();
    }

    private updateFocus(event: MouseEvent, tileIndexes: Position) {
        event.stopPropagation();
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        if (!this.playerService.player.isItsTurn) return;
        if (!this.boardService.canBeFocused(tileIndexes)) return;
        this.focusHandlerService.currentFocus.next(CurrentFocus.BOARD);
    }

    private handleGoodPlacement() {
        const TURN_UPDATE_DELAY = 100;

        setTimeout(() => {
            if (!this.playerService.player.isItsTurn) {
                this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
                return;
            }
        }, TURN_UPDATE_DELAY);
    }

    private handleBadPlacement() {
        setTimeout(() => {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            if (!this.playerService.player.isItsTurn) return;
            this.socketService.send(SocketEvent.ChangeTurn, this.room.roomInfo.name);
        }, ONE_SECOND_IN_MS);
    }

    private drawSpecialTiles() {
        this.setSpecialTiles();
    }

    private setSpecialTiles() {
        for (const tile of specialCases) {
            this.board[tile.position.x][tile.position.y].color = tile.color;
            if (this.board[tile.position.x][tile.position.y].content === '') {
                this.board[tile.position.x][tile.position.y].content = tile.multiplierType + ' x' + tile.multiplierValue;
            }
        }
    }

    private matchRowNumber(row: string): number | void {
        for (let i = 1; i < DEFAULT_CASE_COUNT; i++) {
            if (row === DEFAULT_ROWS[i]) {
                return i;
            }
        }
        return;
    }

    private buildBoardArray() {
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.setUpTiles(this.board);
        this.board[DEFAULT_CASE_COUNT / 2][DEFAULT_CASE_COUNT / 2].content = '★';
        this.initializeRowIndex();
    }

    private initializeRowIndex() {
        for (let i = DEFAULT_STARTING_POSITION + 1; i < DEFAULT_CASE_COUNT; i++) {
            this.board[0][i].content = '' + i;
            this.board[0][i].color = DEFAULT_BOARD_INDEXES_COLOR;
            this.board[0][i].textColor = DEFAULT_INDEX_COLOR;
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
            row[0].border = { color: DEFAULT_BOARD_BORDER_COLOR, width: DEFAULT_BOARD_LINE_WIDTH };
            xPosition += this.tileWidth;
            tileBoard[j] = row;
            content = DEFAULT_ROWS[j + 1];
            row[0].textColor = DEFAULT_INDEX_COLOR;
        }
    }

    private setUpTiles(tilesArray: Tile[][]) {
        this.initializeColumnIndex(tilesArray);

        const tilePosition: Position = { x: DEFAULT_STARTING_POSITION, y: DEFAULT_STARTING_POSITION + this.tileHeight };
        const tileDimension: Dimension = { width: this.tileWidth, height: this.tileHeight };
        for (let i = DEFAULT_STARTING_POSITION; i < DEFAULT_CASE_COUNT; i++) {
            for (let j = DEFAULT_STARTING_POSITION + 1; j < DEFAULT_CASE_COUNT; j++) {
                tilesArray[i][j] = new Tile();
                tilesArray[i][j].setDefaultValues(tilePosition, tileDimension, '', DEFAULT_BOARD_BACKGROUND_COLOR);
                tilesArray[i][j].border = { color: DEFAULT_BOARD_BORDER_COLOR, width: DEFAULT_BOARD_LINE_WIDTH };
                tilePosition.y += this.tileHeight;
            }
            tilePosition.y = this.tileHeight;
            tilePosition.x += this.tileWidth;
        }
    }
}
