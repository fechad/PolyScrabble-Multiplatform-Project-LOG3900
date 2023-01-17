import { AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CurrentFocus } from '@app/classes/current-focus';
import { Dimension } from '@app/classes/dimension';
import { KeyboardKeys } from '@app/classes/keyboard-keys';
import { Player } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { Room } from '@app/classes/room';
import { Tile } from '@app/classes/tile';
import {
    BOARD_SCALING_RATIO,
    DEFAULT_BOARD_BACKGROUND_COLOR,
    DEFAULT_BOARD_BORDER_COLOR,
    DEFAULT_BOARD_INDEXES_COLOR,
    DEFAULT_BOARD_LETTER_SIZE,
    DEFAULT_BOARD_LINE_WIDTH,
    DEFAULT_CASE_COUNT,
    DEFAULT_HEIGHT,
    DEFAULT_INDEX_COLOR,
    DEFAULT_ROWS,
    DEFAULT_STARTING_POSITION,
    DEFAULT_WIDTH,
    specialCases,
} from '@app/constants/board-constants';
import { MAX_RECONNECTION_DELAY, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { BoardGridService } from '@app/services/board-grid.service';
import { BoardService } from '@app/services/board.service';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit, OnChanges {
    @ViewChild('boardCanvas', { static: false }) private boardCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('letterTilesCanvas', { static: false }) private letterTilesCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('viewPlacementCanvas', { static: false }) private viewPlacementCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridContainer', { static: false }) private gridContainer: ElementRef;

    letterRatio: number;
    private ratioSize: number;
    private board: Tile[][];
    private canvasSize: Position;

    constructor(
        private readonly boardGridService: BoardGridService,
        private socketService: SocketClientService,
        private commandInvoker: CommandInvokerService,
        private boardService: BoardService,
        private focusHandlerService: FocusHandlerService,
        private room: Room,
        private player: Player,
    ) {
        this.ratioSize = 1;
        this.letterRatio = BOARD_SCALING_RATIO;

        this.board = new Array<Tile[]>(DEFAULT_CASE_COUNT);

        this.buildBoardArray();

        this.canvasSize.x = this.width * this.ratioSize;
        this.canvasSize.y = this.height * this.ratioSize;

        this.boardService.initializeBoardService({ width: this.tileWidth, height: this.tileHeight, letterRatio: this.letterRatio });
    }

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        switch (event.key) {
            case KeyboardKeys.Enter:
                this.confirmPlacement();
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

    mouseHitDetect(event: MouseEvent) {
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        if (!this.player.isItsTurn) return;
        this.updateFocus(event);
        if (this.focusHandlerService.currentFocus.value !== CurrentFocus.BOARD) return;
        this.boardService.mouseHitDetect({ x: event.offsetX, y: event.offsetY });
    }

    ngOnInit() {
        this.connect();

        this.focusHandlerService.currentFocus.subscribe(() => {
            if (!this.focusHandlerService.isCurrentFocus(CurrentFocus.BOARD)) {
                this.boardService.removeAllViewLetters();
            }
        });
    }

    ngAfterViewInit() {
        this.boardGridService.gridContext = this.boardCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.boardService.setupTileServicesContexts(
            this.letterTilesCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            this.viewPlacementCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
        );

        this.gridContainer.nativeElement.style.height = DEFAULT_HEIGHT + 'px';
        this.gridContainer.nativeElement.style.width = DEFAULT_WIDTH + 'px';

        this.drawBoard();
    }

    ngOnChanges() {
        this.buildBoardArray();
    }

    get width(): number {
        return this.canvasSize.x;
    }
    get height(): number {
        return this.canvasSize.y;
    }

    changePlayerTurn() {
        this.socketService.send('message', '!passer');
    }

    get isActivePlayer(): boolean {
        return this.player.isItsTurn;
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    confirmPlacement() {
        if (this.commandInvoker.commandMessage.length === 0) return;
        this.focusHandlerService.clientChatMessage.next(this.commandInvoker.commandMessage);
        this.socketService.send('message', this.commandInvoker.commandMessage);

        this.handleGoodPlacement();

        this.handleBadPlacement();
    }

    editLetterSize() {
        this.drawBoard();

        this.boardService.reinitializeLettersTiles();
        this.boardService.redrawLettersTile();
    }

    isPlayerTurn(): boolean {
        return this.player.isItsTurn;
    }

    private connect() {
        if (this.socketService.isSocketAlive()) {
            this.boardService.removePlacementCommands();
            this.configureBaseSocketFeatures();
            return;
        }
        this.tryReconnection();
    }

    private tryReconnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.boardService.redrawLettersTile();
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private get tileWidth(): number {
        return (this.width * this.ratioSize) / DEFAULT_CASE_COUNT;
    }

    private get tileHeight(): number {
        return (this.height * this.ratioSize) / DEFAULT_CASE_COUNT;
    }

    private cancelPlacement() {
        this.focusHandlerService.currentFocus.next(CurrentFocus.RACK);
    }

    private drawBoard() {
        this.drawSpecialTiles();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('drawBoard', (placementData: PlacementData) => {
            const rowNumber = this.matchRowNumber(placementData.row) as number;
            this.boardService.drawWord(placementData.word, parseInt(placementData.column, 10), rowNumber, placementData.direction);
        });
    }

    private updateFocus(event: MouseEvent) {
        event.stopPropagation();
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        if (!this.player.isItsTurn) return;
        if (!this.boardService.canBeFocused({ x: event.offsetX, y: event.offsetY })) return;
        this.focusHandlerService.currentFocus.next(CurrentFocus.BOARD);
    }

    private handleGoodPlacement() {
        const TURN_UPDATE_DELAY = 100;

        setTimeout(() => {
            if (!this.player.isItsTurn) {
                this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
                return;
            }
        }, TURN_UPDATE_DELAY);
    }

    private handleBadPlacement() {
        setTimeout(() => {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            if (!this.player.isItsTurn) return;
            this.socketService.send('changeTurn', this.room.roomInfo.name);
        }, ONE_SECOND_IN_MS * 3);
    }

    private drawLetter(tile: Tile) {
        this.boardGridService.drawBoardLetter(tile, DEFAULT_BOARD_LETTER_SIZE * this.letterRatio);
    }

    private drawSpecialTiles() {
        this.setSpecialTiles();
        for (let i = DEFAULT_STARTING_POSITION; i < DEFAULT_CASE_COUNT; i++) {
            for (let j = DEFAULT_STARTING_POSITION; j < DEFAULT_CASE_COUNT; j++) {
                this.boardGridService.drawBoardTile(this.board[i][j]);
                this.drawLetter(this.board[i][j]);
            }
        }
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
            this.board[0][i].content = DEFAULT_ROWS[i];
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
            content = '' + (j + 1);
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
