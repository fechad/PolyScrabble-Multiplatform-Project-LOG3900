/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */ // We want to set private attribute of the class for multiple tests
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentFocus } from '@app/classes/current-focus';
import { KeyboardKeys } from '@app/classes/keyboard-keys';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TIMER_TEST_DELAY } from '@app/constants/constants';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { PlayerService } from '@app/services/player.service';
import { RackGridService } from '@app/services/rack-grid.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { RackComponent } from './rack.component';

const LETTER = 'hello';
const EXCHANGE_MESSAGE = '!échanger';

describe('RackComponent', () => {
    let component: RackComponent;
    let fixture: ComponentFixture<RackComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let rackGridService: RackGridService;
    let focusHandlerService: FocusHandlerService;
    let playerService: PlayerService;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);
        rackGridService = new RackGridService();
        focusHandlerService = new FocusHandlerService();
        playerService = new PlayerService();

        await TestBed.configureTestingModule({
            declarations: [RackComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: RackGridService, useValue: rackGridService },
                { provide: SocketTestHelper, useValue: socketHelper },
                { provide: FocusHandlerService, useValue: focusHandlerService },
                { provide: PlayerService, useValue: playerService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RackComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('socket related tests', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });

        it('should call updateRack when receiving drawRack event', () => {
            const spy = spyOn(componentPrivateAccess['rack'], 'updateRack'); /* .and.callThrough(); */
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('drawRack', LETTER);
            expect(spy).toHaveBeenCalledWith(LETTER);
        });
    });

    describe('areTilesSelectedForExchange() tests', () => {
        it('the tiles should not be selected initially', () => {
            expect(component.areTilesSelectedForExchange()).toBeFalse();
        });
        it('if rack has not been initialized return false', () => {
            // we want to test private methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const componentPrivateAccess = component as any;
            componentPrivateAccess['rack'] = false;
            expect(componentPrivateAccess.areTilesSelectedForExchange()).toBeFalse();
        });
    });

    describe('exchangeLetters() tests', () => {
        it('should send the event "message" with the letters selected', () => {
            component['rack']['rack'][0].content = 'y';
            component['rack']['rack'][1].content = 'e';
            component['rack']['rack'][0].updateSelectionType(SelectionType.EXCHANGE);
            const spy = spyOn(component['socketService'], 'send');
            component.exchangeLetters();
            expect(spy).toHaveBeenCalledWith('message', EXCHANGE_MESSAGE + ' y');
        });

        it('should call cancelExchange()', () => {
            const spy = spyOn(component, 'cancelExchange');
            component.exchangeLetters();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('isExchangeAllowed() tests', () => {
        it('should return false if it is not the player s turn', () => {
            playerService.player.isItsTurn = true;
            expect(component.isExchangeAllowed()).toBeFalse();
        });

        it('should return false if it the letters bank has not enough letters', () => {
            playerService.room.isBankUsable = false;
            expect(component.isExchangeAllowed()).toBeFalse();
        });

        it('should return false if it is its turn but bank is not usable', () => {
            playerService.player.isItsTurn = true;
            playerService.room.isBankUsable = false;
            expect(component.isExchangeAllowed()).toBeFalse();
        });

        it('should return true if the conditions are respected ', () => {
            playerService.room.isBankUsable = true;
            playerService.player.isItsTurn = true;
            const spy = spyOn(component, 'areTilesSelectedForExchange').and.returnValues(true);
            const result = component.isExchangeAllowed();
            expect(spy).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });
        it('should return false if the conditions are not respected ', () => {
            playerService.room.isBankUsable = true;
            playerService.player.isItsTurn = false;
            const spy = spyOn(component, 'areTilesSelectedForExchange').and.returnValues(true);
            const result = component.isExchangeAllowed();
            expect(spy).not.toHaveBeenCalled();
            expect(result).toBeFalse();
        });
    });

    describe('onRightClick() tests', () => {
        it('should call rack.onRightClick', () => {
            const spy = spyOn(component['rack'], 'onRightClick').and.callFake((clickX: number, clickY: number) => {
                return clickX + clickY;
            });
            component.onRightClick(0, 0);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('buttonDetect tests', () => {
        let moveTileSpy: jasmine.Spy;
        beforeEach(() => {
            moveTileSpy = spyOn(component['rack'], 'moveTile').and.callFake(() => {
                return;
            });
        });
        it('should call moveTile with direction right when ArrowRight is pressed', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: KeyboardKeys.ArrowRight });
            component.buttonDetect(keyEvent);
            expect(moveTileSpy).toHaveBeenCalledWith(Direction.Right);
        });
        it('should call moveTile with direction left when ArrowLeft is pressed', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: KeyboardKeys.ArrowLeft });
            component.buttonDetect(keyEvent);
            expect(moveTileSpy).toHaveBeenCalledWith(Direction.Left);
        });
        it('should call selectLetterTile with event.key when something that is not Left or Right direction is pressed', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: 'd' });
            const selectLetterTileSpy = spyOn(component['rack'], 'selectLetterTile').and.callFake(() => {
                return;
            });
            component.buttonDetect(keyEvent);
            expect(selectLetterTileSpy).toHaveBeenCalledWith('d');
        });
    });

    describe('mouseScrollDetect tests', () => {
        let moveTileSpy: jasmine.Spy;
        beforeEach(() => {
            moveTileSpy = spyOn(component['rack'], 'moveTile').and.callFake(() => {
                return;
            });
        });
        it('should call moveTile with direction right when scrolling down', () => {
            const wheelEvent = new WheelEvent('mousewheel', { deltaY: -1 });
            component.mouseScrollDetect(wheelEvent);
            expect(moveTileSpy).toHaveBeenCalledWith(Direction.Right);
        });
        it('should call moveTile with direction left when scrolling up', () => {
            const wheelEvent = new WheelEvent('mousewheel', { deltaY: 1 });
            component.mouseScrollDetect(wheelEvent);
            expect(moveTileSpy).toHaveBeenCalledWith(Direction.Left);
        });
    });
    describe('mouseHitDetect tests', () => {
        it('should not call rack.mouseHitDetect on mouseHitDetect if game is over', () => {
            const mouseEvent = new MouseEvent('click');
            const mouseHitDetectSpy = spyOn(component['rack'], 'mouseHitDetect');
            component['room'].roomInfo.isGameOver = true;
            component.mouseHitDetect(mouseEvent);
            expect(mouseHitDetectSpy).not.toHaveBeenCalledWith(mouseEvent);
        });
        it('should call rack.mouseHitDetect on mouseHitDetect', () => {
            const mouseEvent = new MouseEvent('click');
            const mouseHitDetectSpy = spyOn(component['rack'], 'mouseHitDetect');
            component.mouseHitDetect(mouseEvent);
            expect(mouseHitDetectSpy).toHaveBeenCalledWith(mouseEvent);
        });
    });
    describe('updateFocus tests', () => {
        // we want to test private methods
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let componentPrivateAccess: any;

        beforeEach(() => {
            componentPrivateAccess = component;
        });
        const mouseEvent = {
            button: 0,
            stopPropagation: () => {
                return;
            },
        } as MouseEvent;
        it('should stop propagation', () => {
            const spy = spyOn(mouseEvent, 'stopPropagation').and.callFake(() => {
                return;
            });
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(spy).toHaveBeenCalled();
        });
        it('should update focus for chat if game is over ', () => {
            componentPrivateAccess.room.roomInfo.isGameOver = true;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.CHAT);
        });
        it('should update focus for rack if game is not over ', () => {
            componentPrivateAccess.room.roomInfo.isGameOver = false;
            componentPrivateAccess.updateFocus(mouseEvent);
            expect(focusHandlerService.currentFocus.value).toEqual(CurrentFocus.RACK);
        });
    });

    it('should call onFirstSocketConnection on connectSocket', (done) => {
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const configureBaseSocketFeatureSpy = spyOn(component as any, 'configureBaseSocketFeatures');
        const spy = spyOn(component as any, 'onFirstSocketConnection');

        (component as any).connectSocket();

        setTimeout(() => {
            expect(configureBaseSocketFeatureSpy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
            done();
        }, TIMER_TEST_DELAY);
    });

    it('should call onRefresh on configureSocketFeaturesOnPageSocketConnection', (done) => {
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const configureBaseSocketFeatureSpy = spyOn(component as any, 'configureBaseSocketFeatures');
        const spy = spyOn(component as any, 'onRefresh');

        (component as any).configureSocketFeaturesOnPageSocketConnection();

        setTimeout(() => {
            expect(configureBaseSocketFeatureSpy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
            done();
        }, TIMER_TEST_DELAY);
    });
});
