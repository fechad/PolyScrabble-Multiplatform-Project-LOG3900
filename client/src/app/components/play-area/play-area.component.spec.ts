/* eslint-disable max-lines */ // Lot of tests to make sure that the code work correctly
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Tile } from '@app/classes/tile';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TIMER_TEST_DELAY } from '@app/constants/constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { BoardGridService } from '@app/services/board-grid.service';
import { BoardService } from '@app/services/board.service';
import { CommandInvokerService } from '@app/services/command-invoker.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { LetterTileService } from '@app/services/letter-tile.service';
import { PlacementViewTilesService } from '@app/services/placement-view-tiles.service';
import { RackGridService } from '@app/services/rack-grid.service';
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
    let formBuilder: FormBuilder;
    let boardGridService: BoardGridService;
    let sessionStorageService: SessionStorageService;
    let letterTileService: LetterTileService;
    let commandInvokerService: CommandInvokerService;
    let focusHandlerService: FocusHandlerService;
    let mouseEvent: MouseEvent;
    let boardService: BoardService;

    let player: Player;
    let room: Room;

    let removeAllViewLetterSpy: jasmine.Spy;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        boardGridService = new BoardGridService();
        sessionStorageService = new SessionStorageService();
        letterTileService = new LetterTileService();
        commandInvokerService = new CommandInvokerService();
        focusHandlerService = new FocusHandlerService();

        player = new Player();
        room = new Room();
        room.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: 'classic', maxPlayers: 2 };
        room.currentPlayerPseudo = '';

        boardService = new BoardService(
            new PlacementViewTilesService(),
            letterTileService,
            sessionStorageService,
            commandInvokerService,
            new Rack(letterTileService, new RackGridService()),
        );

        placement = { word: 'bonjour', row: 'h', column: '7', direction: 'h' };

        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: BoardService, useValue: boardService },
                { provide: BoardGridService, useValue: boardGridService },
                { provide: SocketTestHelper, useValue: socketHelper },
                { provide: SessionStorageService, useValue: sessionStorageService },
                { provide: LetterTileService, useValue: letterTileService },
                { provide: CommandInvokerService, useValue: commandInvokerService },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: Player, useValue: player },
                { provide: Room, useValue: room },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        removeAllViewLetterSpy = spyOn(boardService, 'removeAllViewLetters');
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
            const spy = spyOn(componentPrivateAccess, 'matchRowNumber').and.callThrough();
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
            let configureBaseSocketFeatureSpy: jasmine.Spy;
            beforeEach(() => {
                removePlacementCommandsSpy = spyOn(boardService, 'removePlacementCommands');
                configureBaseSocketFeatureSpy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            });

            it('should call the correct methods if the socket is alive', () => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);

                componentPrivateAccess.connect();
                expect(configureBaseSocketFeatureSpy).toHaveBeenCalled();
                expect(removePlacementCommandsSpy).toHaveBeenCalled();
            });

            it('should try to reconnect if the socket is not alive', () => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
                const spy = spyOn(componentPrivateAccess, 'tryReconnection');
                componentPrivateAccess.connect();
                expect(spy).toHaveBeenCalled();
            });

            it('should reconnect and redraw letter tiles if the socket is alive', (done) => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
                const spy = spyOn(boardService, 'redrawLettersTile');
                componentPrivateAccess.tryReconnection();

                setTimeout(() => {
                    expect(configureBaseSocketFeatureSpy).toHaveBeenCalled();
                    expect(spy).toHaveBeenCalled();
                    done();
                }, TIMER_TEST_DELAY);
            });

            it('should not reconnect if the socket is not alive after 5 sec', (done) => {
                spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
                componentPrivateAccess.tryReconnection();

                setTimeout(() => {
                    expect(configureBaseSocketFeatureSpy).not.toHaveBeenCalled();
                    done();
                }, TIMER_TEST_DELAY);
            });
        });
    });

    it('matchRow should match the letter given to the index ', () => {
        const result = 15;
        expect(componentPrivateAccess.matchRowNumber('o')).toEqual(result);
    });
    it('matchRow should return undefined if an empty string is given ', () => {
        expect(componentPrivateAccess.matchRowNumber('')).toBe(undefined);
    });
    it('matchRow should return undefined if a letter upper than o is given ', () => {
        expect(componentPrivateAccess.matchRowNumber('w')).toBe(undefined);
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
                    return { tile: new Tile() };
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
            player.isItsTurn = true;

            componentPrivateAccess.confirmPlacement();

            setTimeout(() => {
                expect(sendSpy).toHaveBeenCalledWith('message', commandMessage);
                done();
            }, FAILURE_TIMER);
        });

        it('should set the focus to chat after a successful placement with mouse', (done) => {
            player.isItsTurn = false;
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
            player.isItsTurn = true;

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
        let updateFocusSpy: jasmine.Spy;
        let mouseHitDetectSpy: jasmine.Spy;
        beforeEach(() => {
            expectedPosition = { x: 625, y: 466 };
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
            room.roomInfo.isGameOver = false;
            player.isItsTurn = true;
            focusHandlerService.currentFocus.next(CurrentFocus.BOARD);

            component.mouseHitDetect(mouseEvent);

            expect(updateFocusSpy).toHaveBeenCalledWith(mouseEvent);
            expect(mouseHitDetectSpy).toHaveBeenCalledWith(expectedPosition);
        });

        it('should not call updateFocus and mouseHitDetect if game is over', () => {
            room.roomInfo.isGameOver = true;
            component.mouseHitDetect(mouseEvent);

            expect(updateFocusSpy).not.toHaveBeenCalled();
            expect(mouseHitDetectSpy).not.toHaveBeenCalled();
        });

        it('should not call updateFocus and mouseHitDetect if it is not player turn', () => {
            room.roomInfo.isGameOver = false;
            player.isItsTurn = false;
            component.mouseHitDetect(mouseEvent);

            expect(updateFocusSpy).not.toHaveBeenCalled();
            expect(mouseHitDetectSpy).not.toHaveBeenCalled();
        });

        it('should not call mouseHitDetect if the focus is not the board', () => {
            room.roomInfo.isGameOver = false;
            player.isItsTurn = true;
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);

            component.mouseHitDetect(mouseEvent);

            expect(updateFocusSpy).toHaveBeenCalledWith(mouseEvent);
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

    describe('subscribe tests', () => {
        it('should call removeAllViewLetter if the focus is no longer the board', () => {
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            expect(removeAllViewLetterSpy).toHaveBeenCalled();
        });

        it('should not call removeAllViewLetter if the focus is still the board', () => {
            focusHandlerService.currentFocus.next(CurrentFocus.BOARD);
            expect(removeAllViewLetterSpy).toHaveBeenCalled();
        });
    });

    describe('updateFocus tests', () => {
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
            room.roomInfo.isGameOver = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
        });

        it('should not change the focus to board if it is not the player turn', () => {
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(true);
            player.isItsTurn = false;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).not.toHaveBeenCalled();
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.NONE);
        });

        it('should not change the focus to board if cant be focused', () => {
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(false);
            player.isItsTurn = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.NONE);
        });

        it('should update the focus to board if the game is not over, it is the player turn, and it can be focused', () => {
            focusHandlerService.currentFocus.next(CurrentFocus.NONE);
            const canBeFocusedSpy = spyOn(boardService, 'canBeFocused').and.returnValue(true);
            player.isItsTurn = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(canBeFocusedSpy).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.BOARD);
        });
    });

    it('should return true if the gameOver attribute of the room is true', () => {
        room.roomInfo.isGameOver = true;
        expect(component.isGameOver).toEqual(true);
    });
    it('should return true if the gameOver attribute of the room is true', () => {
        room.roomInfo.isGameOver = false;
        expect(component.isGameOver).toEqual(false);
    });
});
