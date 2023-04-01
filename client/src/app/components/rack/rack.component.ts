import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { KeyboardKeys } from '@app/classes/keyboard-keys';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room';
import { Tile } from '@app/classes/tile';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { SocketEvent } from '@app/enums/socket-event';
import { BoardService } from '@app/services/board.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

const MESSAGE = 'message';
const SWITCH_COMMAND = '!échanger';
@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent extends ComponentCommunicationManager implements OnInit {
    @ViewChild('rackContainer', { static: false }) private rackContainer!: ElementRef<HTMLCanvasElement>;
    constructor(
        private focusHandlerService: FocusHandlerService,
        protected rack: Rack,
        protected boardService: BoardService,
        protected socketService: SocketClientService,
        private readonly playerService: PlayerService,
    ) {
        super(socketService);
    }

    get room(): Room {
        return this.playerService.room;
    }

    get selectionType(): typeof SelectionType {
        return SelectionType;
    }

    mouseScrollDetect(event: WheelEvent) {
        if (event.deltaY < 0) {
            this.rack.moveTile(Direction.Right);
        } else {
            this.rack.moveTile(Direction.Left);
        }
    }

    ngOnInit() {
        this.connectSocket();
        this.focusHandlerService.currentFocus.subscribe(() => {
            if (this.focusHandlerService.isCurrentFocus(CurrentFocus.RACK)) {
                this.rackContainer.nativeElement.focus();
                return;
            }
            this.unselect();
        });
    }

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

    // TODO: add this on mouseOver Event for firefox navigator
    onMouseOver(container: HTMLDivElement) {
        if (this.boardService.isDraggingATile) {
            container.dispatchEvent(new Event('mouseup'));
        }
    }

    dragEnd() {
        if (!this.playerService.player.isItsTurn) return;
        if (!this.boardService.isDraggingATile) return;
        this.boardService.removeManipulatedTile();
        this.boardService.isDraggingATile = false;
    }

    drop(event: CdkDragDrop<Tile[]>) {
        moveItemInArray(this.rack.rackTiles, event.previousIndex, event.currentIndex);
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        if (this.room.roomInfo.isGameOver) {
            return;
        }
        this.focusHandlerService.currentFocus.next(CurrentFocus.RACK);
    }

    mouseHitDetect(event: MouseEvent) {
        if (this.room.roomInfo.isGameOver) {
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
