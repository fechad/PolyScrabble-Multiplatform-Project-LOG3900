import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { KeyboardKeys } from '@app/classes/keyboard-keys';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room';
import { DEFAULT_RACK_HEIGHT, DEFAULT_RACK_WIDTH } from '@app/constants/rack-constants';
import { Direction } from '@app/enums/direction';
import { SocketEvent } from '@app/enums/socket-event';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { LetterTileService } from '@app/services/letter-tile.service';
import { PlayerService } from '@app/services/player.service';
import { RackGridService } from '@app/services/rack-grid.service';
import { SocketClientService } from '@app/services/socket-client.service';

const MESSAGE = 'message';
const SWITCH_COMMAND = '!échanger';
@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent extends ComponentCommunicationManager implements OnInit, AfterViewInit {
    @ViewChild('rackCanvas', { static: false }) private rackCanvas!: ElementRef<HTMLCanvasElement>;
    private canvasSize = { x: DEFAULT_RACK_WIDTH, y: DEFAULT_RACK_HEIGHT };
    constructor(
        private readonly letterTileService: LetterTileService,
        private readonly rackGridService: RackGridService,
        private focusHandlerService: FocusHandlerService,
        private rack: Rack,
        protected socketService: SocketClientService,
        private readonly playerService: PlayerService,
        private readonly room: Room,
    ) {
        super(socketService);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        switch (event.key) {
            case KeyboardKeys.ArrowRight:
                this.rack.moveTile(Direction.Right);
                break;
            case KeyboardKeys.ArrowLeft:
                this.rack.moveTile(Direction.Left);
                break;
            default:
                this.rack.selectLetterTile(event.key);
                break;
        }
    }

    @HostListener('mousewheel', ['$event'])
    mouseScrollDetect(event: WheelEvent) {
        if (event.deltaY < 0) {
            this.rack.moveTile(Direction.Right);
        } else {
            this.rack.moveTile(Direction.Left);
        }
    }

    ngAfterViewInit(): void {
        this.rackGridService.gridContext = this.rackCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rack.letterTileService = this.letterTileService;
        this.rack.rackGridService = this.rackGridService;
    }
    ngOnInit() {
        this.connectSocket();
        this.focusHandlerService.currentFocus.subscribe(() => {
            if (this.focusHandlerService.isCurrentFocus(CurrentFocus.RACK)) {
                this.rackCanvas.nativeElement.contentEditable = 'true';
                this.rackCanvas.nativeElement.focus();
                return;
            }
            this.unselect();
        });
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        this.focusHandlerService.currentFocus.next(CurrentFocus.RACK);
    }

    mouseHitDetect(event: MouseEvent) {
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        this.rack.mouseHitDetect(event);
    }

    onRightClick(clickX: number, clickY: number) {
        this.rack.onRightClick(clickX, clickY);
    }

    exchangeLetters() {
        const letters = this.rack.getSelectedLettersForExchange();
        this.cancelExchange();

        this.focusHandlerService.clientChatMessage.next(`${SWITCH_COMMAND} ${letters}`);
        this.socketService.send(MESSAGE, `${SWITCH_COMMAND} ${letters}`);
    }

    cancelExchange() {
        this.rack.cancelExchange();
    }

    areTilesSelectedForExchange(): boolean {
        if (!this.rack) return false;
        return this.rack.areTilesSelectedForExchange();
    }

    isExchangeAllowed(): boolean {
        if (!this.playerService.player.isItsTurn) return false;
        if (!this.room.isBankUsable) return false;
        if (!this.areTilesSelectedForExchange()) return false;
        return true;
    }

    protected onFirstSocketConnection(): void {
        this.socketService.send(SocketEvent.GetRackInfos, this.room.roomInfo.name);
    }

    protected onRefresh(): void {
        this.socketService.send(SocketEvent.GetRackInfos, this.room.roomInfo.name);
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.DrawRack, (letters: string) => {
            this.rack.updateRack(letters);
        });
    }

    private unselect() {
        this.cancelExchange();
    }
}
