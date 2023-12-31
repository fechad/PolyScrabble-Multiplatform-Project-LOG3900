/* eslint-disable max-lines */ // Lot of tests to make sure that the code work correctly
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CurrentFocus } from '@app/classes/current-focus';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Tile } from '@app/classes/tile';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DEFAULT_ROOM_INFO } from '@app/constants/constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { BoardService } from '@app/services/board.service';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}
describe('PlayAreaComponent', () => {
    // we want to test private methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let componentPrivateAccess: any;
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let placement: PlacementData;
    let sessionStorageService: SessionStorageService;
    let commandInvokerService: CommandInvokerService;
    let focusHandlerService: FocusHandlerService;
    let mouseEvent: MouseEvent;
    let boardService: BoardService;
    let matDialog: MatDialog;
    let playerService: PlayerService;

    // let removeAllViewLetterSpy: jasmine.Spy;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        sessionStorageService = new SessionStorageService();
        commandInvokerService = new CommandInvokerService(socketServiceMock);
        focusHandlerService = new FocusHandlerService();

        playerService = new PlayerService();
        playerService.room.roomInfo = DEFAULT_ROOM_INFO;
        playerService.room.currentPlayerPseudo = '';

        matDialog = new MatDialogMock() as unknown as MatDialog;
        boardService = new BoardService(sessionStorageService, commandInvokerService, matDialog, new Rack());

        placement = { word: 'bonjour', row: 'h', column: '7', direction: 'h' };

        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: CommandInvokerService, useValue: commandInvokerService },
                { provide: BoardService, useValue: boardService },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: PlayerService, useValue: playerService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        // removeAllViewLetterSpy = spyOn(boardService, 'removeAllViewLetters');
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        componentPrivateAccess = component as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('socket related tests', () => {
        it('should call matchRowNumber when receiving drawBoard event', () => {
            const spy = spyOn(boardService, 'matchRowNumber').and.callThrough();
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('drawBoard', placement.row);
            expect(spy).toHaveBeenCalled();
        });

        it('should call socketService.send with good attributes on changePlayerTurn', () => {
            const spy = spyOn(socketServiceMock, 'send');
            component.changePlayerTurn();
            expect(spy).toHaveBeenCalledWith('message', '!passer');
        });

        describe('connect() tests', () => {
            let removePlacementCommandsSpy: jasmine.Spy;
            beforeEach(() => {
                removePlacementCommandsSpy = spyOn(boardService, 'removePlacementCommands');
            });

            it('should call the correct methods if the socket is alive', () => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
                componentPrivateAccess.connectSocket();
                expect(removePlacementCommandsSpy).toHaveBeenCalled();
            });
        });
    });

    it('should call buildArray when ngOnChanges is called', () => {
        const spy = spyOn(componentPrivateAccess, 'buildBoardArray').and.callThrough();
        componentPrivateAccess.ngOnChanges();
        expect(spy).toHaveBeenCalled();
    });

    describe('confirmPlacement tests', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to access private attribute
        let placeLetterCommandMock: any;

        beforeEach(() => {
            placeLetterCommandMock = {
                getPlaceInfo: () => {
                    return { tile: new Tile(), indexes: { x: 0, y: 0 } };
                },
                cancel: () => {
                    return;
                },
            };
        });
        it('should call the correct methods when placement fail', (done) => {
            const FAILURE_TIMER = 4000;
            // eslint-disable-next-line dot-notation -- we want to access private attribute
            commandInvokerService['cancelStack'] = [placeLetterCommandMock];
            const sendSpy = spyOn(socketServiceMock, 'send');
            const commandMessage = commandInvokerService.commandMessage;
            playerService.player.isItsTurn = true;

            componentPrivateAccess.confirmPlacement();

            setTimeout(() => {
                expect(sendSpy).toHaveBeenCalledWith('message', commandMessage);
                done();
            }, FAILURE_TIMER);
        });

        it('should set the focus to chat after a successful placement with mouse', (done) => {
            playerService.player.isItsTurn = false;
            const FAILURE_TIMER = 4000;

            // eslint-disable-next-line dot-notation -- we want to access private attribute
            commandInvokerService['cancelStack'] = [placeLetterCommandMock];
            const commandMessage = commandInvokerService.commandMessage;

            const sendSpy = spyOn(socketServiceMock, 'send');
            componentPrivateAccess.confirmPlacement();

            setTimeout(() => {
                expect(sendSpy).toHaveBeenCalledWith('message', commandMessage);
                expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
                done();
            }, FAILURE_TIMER);
        });

        it('should add the command in chat after confirmPlacement', () => {
            playerService.player.isItsTurn = true;

            // eslint-disable-next-line dot-notation -- we want to access private attribute
            commandInvokerService['cancelStack'] = [placeLetterCommandMock];
            const spy = spyOn(focusHandlerService.clientChatMessage, 'next');
            componentPrivateAccess.confirmPlacement();
            expect(spy).toHaveBeenCalledWith(commandInvokerService.commandMessage);
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
        });

        it('should call confirmPlacement when Enter is pressed', () => {
            const event = { key: 'Enter' } as KeyboardEvent;
            const spy = spyOn(component, 'confirmPlacement').and.callFake(() => {
                return;
            });
            component.buttonDetect(event);
            expect(spy).toHaveBeenCalled();
        });

        it('should not send the placement signal if there is no command', () => {
            const spy = spyOn(socketServiceMock, 'send');
            componentPrivateAccess.confirmPlacement();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('mouseHitDetect tests', () => {
        let expectedPosition: Position;
        let tileIndexes: Position;
        let updateFocusSpy: jasmine.Spy;
        let mouseHitDetectSpy: jasmine.Spy;
        beforeEach(() => {
            expectedPosition = { x: 625, y: 466 };
            tileIndexes = { x: 1, y: 1 };
            mouseEvent = {
                offsetX: expectedPosition.x,
                offsetY: expectedPosition.y,
                button: 0,
                stopPropagation: () => {
                    return;
                },
            } as MouseEvent;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test a private method
            updateFocusSpy = spyOn(component as any, 'updateFocus');
            mouseHitDetectSpy = spyOn(boardService, 'mouseHitDetect');
        });

        it('should call the correct methods on mouseHitDetect', () => {
            playerService.room.roomInfo.isGameOver = false;
            playerService.player.isItsTurn = true;
            focusHandlerService.currentFocus.next(CurrentFocus.BOARD);

            component.mouseHitDetect(mouseEvent, tileIndexes);

            expect(updateFocusSpy).toHaveBeenCalled();
            expect(mouseHitDetectSpy).toHaveBeenCalled();
        });

        it('should not call updateFocus and mouseHitDetect if game is over', () => {
            playerService.room.roomInfo.isGameOver = true;
            component.mouseHitDetect(mouseEvent, tileIndexes);

            expect(updateFocusSpy).not.toHaveBeenCalled();
            expect(mouseHitDetectSpy).not.toHaveBeenCalled();
        });

        it('should not call updateFocus and mouseHitDetect if it is not player turn', () => {
            playerService.room.roomInfo.isGameOver = false;
            playerService.player.isItsTurn = false;
            component.mouseHitDetect(mouseEvent, tileIndexes);

            expect(updateFocusSpy).not.toHaveBeenCalled();
            expect(mouseHitDetectSpy).not.toHaveBeenCalled();
        });

        it('should not call mouseHitDetect if the focus is not the board', () => {
            playerService.room.roomInfo.isGameOver = false;
            playerService.player.isItsTurn = true;
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);

            component.mouseHitDetect(mouseEvent, tileIndexes);

            expect(updateFocusSpy).toHaveBeenCalled();
            expect(mouseHitDetectSpy).not.toHaveBeenCalled();
        });
    });

    describe('buttonHitDetect tests', () => {
        it('should call commandInvoker.cancel when Backspace is pressed', () => {
            const event = { key: 'Backspace' } as KeyboardEvent;
            const spy = spyOn(componentPrivateAccess.commandInvoker, 'cancel').and.callThrough();
            componentPrivateAccess.buttonDetect(event);
            expect(spy).toHaveBeenCalled();
        });
        it('should call cancelPlacement when Escape is pressed', () => {
            const event = { key: 'Escape' } as KeyboardEvent;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We want to test a private method
            const spy = spyOn(component as any, 'cancelPlacement').and.callThrough();
            component.buttonDetect(event);
            expect(spy).toHaveBeenCalled();
        });
        it('should call boardService.placeLetterInBoard when other key is pressed', () => {
            const event = { key: 'e' } as KeyboardEvent;
            const spy = spyOn(componentPrivateAccess.boardService, 'placeLetterInBoard').and.callThrough();
            componentPrivateAccess.buttonDetect(event);
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('Build Array', () => {
        it('should call initializeColumnIndex when buildBoardArray is called', () => {
            const spy = spyOn(componentPrivateAccess, 'initializeColumnIndex').and.callThrough();
            componentPrivateAccess.buildBoardArray();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('editLetterSize should call the correct methods ', () => {
        const spy1 = spyOn(componentPrivateAccess, 'drawBoard');
        const spy2 = spyOn(boardService, 'reinitializeLettersTiles');
        const spy3 = spyOn(boardService, 'redrawLettersTile');
        componentPrivateAccess.editLetterSize();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
    });

    // describe('subscribe tests', () => {
    //     it('should call removeAllViewLetter if the focus is no longer the board', () => {
    //         focusHandlerService.currentFocus.next(CurrentFocus.NONE);
    //         expect(removeAllViewLetterSpy).toHaveBeenCalled();
    //     });

    //     it('should not call removeAllViewLetter if the focus is still the board', () => {
    //         focusHandlerService.currentFocus.next(CurrentFocus.BOARD);
    //         expect(removeAllViewLetterSpy).toHaveBeenCalled();
    //     });
    // });

    describe('updateFocus tests', () => {
        beforeEach(() => {
            playerService.room.roomInfo.isGameOver = false;
        });

        mouseEvent = {
            offsetX: 1,
            offsetY: 2,
            stopPropagation: () => {
                return;
            },
        } as MouseEvent;

        it('should stop propagation on updateFocus', () => {
            const mouseEventSpy = spyOn(mouseEvent, 'stopPropagation').and.callFake(() => {
                return;
            });
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(mouseEventSpy).toHaveBeenCalled();
        });

        it('should change the focus to chat on updateFocus if the gameIsOver', () => {
            playerService.room.roomInfo.isGameOver = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
        });

        it('should not change the focus to board if it is not the player turn', () => {
            // Expected 'Chat' to equal 'None'.
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(true);
            playerService.player.isItsTurn = false;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).not.toHaveBeenCalled();
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.NONE);
        });

        it('should not change the focus to board if cant be focused', () => {
            // spy never called
            // Expected 'Chat' to equal 'None'.
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(false);
            playerService.player.isItsTurn = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).toHaveBeenCalled();
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.NONE);
        });

        it('should update the focus to board if the game is not over, it is the player turn, and it can be focused', () => {
            // spy never called
            // expected chat to equal board
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(true);
            playerService.player.isItsTurn = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).toHaveBeenCalled();
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.BOARD);
        });
    });

    it('should return true if the gameOver attribute of the room is true', () => {
        playerService.room.roomInfo.isGameOver = true;
        expect(component.isGameOver).toEqual(true);
    });
    it('should return true if the gameOver attribute of the room is true', () => {
        playerService.room.roomInfo.isGameOver = false;
        expect(component.isGameOver).toEqual(false);
    });
});
