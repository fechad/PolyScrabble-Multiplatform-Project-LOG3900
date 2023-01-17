/* eslint-disable max-lines */ // Many test to be sure that the service work correctly
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to test private method and set some attribute to undefined
import { TestBed } from '@angular/core/testing';
import { BoardMessage } from '@app/classes/board-message';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Position } from '@app/classes/position';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { BOARD_SCALING_RATIO } from '@app/constants/board-constants';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { LetterTileService } from '@app/services/letter-tile.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { BoardService } from './board.service';
import { CommandInvokerService } from './command-invoker.service';
import { PlacementViewTilesService } from './placement-view-tiles.service';
import { RackGridService } from './rack-grid.service';

const RANDOM_VALID_CASE = 5;
const RANDOM_INVALID_CASE = -2;
const INVALID_TILE = 16;

class GridContextMock {
    font = '';
    fillStyle = '';
    textAlign = '';
    textBaseline = '';

    clearRect() {
        return;
    }
    fillRect() {
        return;
    }
    fillText() {
        return;
    }
    beginPath() {
        return;
    }
    moveTo() {
        return;
    }
    lineTo() {
        return;
    }
    stroke() {
        return;
    }
}

describe('BoardService', () => {
    const randomLetter = 'a';

    let service: BoardService;
    let placeLetterInfo1: PlaceLetterInfo;
    let placeLetterInfo2: PlaceLetterInfo;
    let tile: Tile;
    let tile2: Tile;
    let rack: Rack;

    let sessionStorageService: SessionStorageService;
    let letterTileService: LetterTileService;
    let placementViewTileService: PlacementViewTilesService;
    let commandInvokerService: CommandInvokerService;
    let rackGridService: RackGridService;

    let servicePrivateAccess: any;
    let letterTileServiceGridMock: any;
    let placementViewTileServiceGridMock: any;

    beforeEach(async () => {
        sessionStorageService = new SessionStorageService();
        letterTileService = new LetterTileService();
        placementViewTileService = new PlacementViewTilesService();
        rackGridService = new RackGridService();
        commandInvokerService = new CommandInvokerService();
        rack = new Rack(letterTileService, rackGridService);
        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: SessionStorageService, useValue: sessionStorageService },
                { provide: LetterTileService, useValue: letterTileService },
                { provide: PlacementViewTilesService, useValue: placementViewTileService },
                { provide: CommandInvokerService, useValue: commandInvokerService },
                { provide: Rack, useValue: rack },
            ],
        });
        service = TestBed.inject(BoardService);

        tile = new Tile();
        tile.content = '';
        tile2 = new Tile();
        tile2.content = '';

        placeLetterInfo1 = {
            lettersInBoard: new Array<Tile[]>(),
            rack,
            tile,
            dimension: { width: 0, height: 0, letterRatio: 0 },
            letter: tile.content,
            indexes: { x: 0, y: 0 },
        };

        placeLetterInfo2 = {
            lettersInBoard: new Array<Tile[]>(),
            rack,
            tile: tile2,
            dimension: { width: 0, height: 0, letterRatio: 0 },
            letter: tile2.content,
            indexes: { x: 0, y: 1 },
        };

        letterTileServiceGridMock = new GridContextMock();
        placementViewTileServiceGridMock = new GridContextMock();

        service.setupTileServicesContexts(letterTileServiceGridMock, placementViewTileServiceGridMock);
        service.initializeBoardService({ width: tile.width, height: tile.height, letterRatio: BOARD_SCALING_RATIO });
        servicePrivateAccess = service as any;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('mouseHitDetect tests', () => {
        const mousePosition: Position = { x: 300, y: 300 };
        it('should not detect any new hit if commandInvoker.canSelectFirstCaseForPlacement is false', () => {
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');
            commandInvokerService.canSelectFirstCaseForPlacement = false;
            service.mouseHitDetect(mousePosition);
            expect(drawArrowSpy).not.toHaveBeenCalled();
        });

        it('should call removeLetterTile after a mouseHit if there was a previousTile', () => {
            const removeLetterTileSpy = spyOn(placementViewTileService, 'removeLetterTile');
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.mouseHitDetect(mousePosition);
            expect(removeLetterTileSpy).toHaveBeenCalled();
        });

        it('should set the previousTile to empty string if the new selectedTile is not the same', () => {
            placeLetterInfo1.tile.content = randomLetter;
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo2);
            commandInvokerService.selectedTile = placeLetterInfo1;

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalledWith(mousePosition);
            expect(placeLetterInfo1.tile.content).toEqual('');
        });

        it('should not call drawArrow if there are no selected tile', () => {
            spyOn(service as any, 'getSelectedTile');
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');

            service.mouseHitDetect(mousePosition);
            expect(drawArrowSpy).not.toHaveBeenCalled();
            expect(placeLetterInfo1.tile.content).toEqual('');
        });

        it('should set selectedTile to undefined if the tile is not empty and not an arrow', () => {
            commandInvokerService.selectedTile = placeLetterInfo1;
            placeLetterInfo1.tile.content = randomLetter;
            placeLetterInfo2.tile.content = randomLetter;
            spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo2);
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');

            const undefinedPlaceLetterInfo: any = undefined;

            service.mouseHitDetect(mousePosition);
            expect(drawArrowSpy).not.toHaveBeenCalled();
            expect(commandInvokerService.selectedTile).toEqual(undefinedPlaceLetterInfo);
        });

        it('should update selectionType and draw the right Arrow if there is no content in the tile', () => {
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo1);
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalledWith(mousePosition);
            expect(updateSelectionSpy).toHaveBeenCalledWith(SelectionType.BOARD);
            expect(drawArrowSpy).toHaveBeenCalled();
            expect(tile.content).toEqual(RIGHT_ARROW);
        });

        it('should update selectionType and draw the correct Arrow if there is an arrow in the tile', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo1);
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalledWith(mousePosition);
            expect(updateSelectionSpy).toHaveBeenCalledWith(SelectionType.BOARD);
            expect(drawArrowSpy).toHaveBeenCalled();
            expect(tile.content).toEqual(DOWN_ARROW);
        });

        it('should not update selectionType and draw the correct Arrow if the mouse position is inTheFirstRow or Column', () => {
            const invalidMousePosition = { x: 0, y: 0 };
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();
            const drawArrowSpy = spyOn(placementViewTileService, 'drawArrow');

            service.mouseHitDetect(invalidMousePosition);
            expect(updateSelectionSpy).not.toHaveBeenCalledWith(SelectionType.BOARD);
            expect(drawArrowSpy).not.toHaveBeenCalled();
        });
    });

    describe('placeLetterInBoard tests', () => {
        let executeCommandSpy: jasmine.Spy;
        beforeEach(() => {
            executeCommandSpy = spyOn(commandInvokerService, 'executeCommand');
            // want to set a private attribute to test
            // eslint-disable-next-line dot-notation
            rack['rack'][0].content = randomLetter;
            // want to set a private attribute to test
            // eslint-disable-next-line dot-notation
            rack['rack'][1].content = '*';
        });

        it('should not execute the command if there is no selectedTile', () => {
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).not.toHaveBeenCalled();
        });

        it('should not execute the command if the selectedTile does not have an arrow', () => {
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).not.toHaveBeenCalled();
        });

        it('should not execute the command if the rack does not have the letter', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            const letterNotInRack = 'b';
            service.placeLetterInBoard(letterNotInRack);
            expect(executeCommandSpy).not.toHaveBeenCalled();
        });

        it('should not execute the command if the transformed letter is empty', () => {
            const transFormSpecialCharSpy = spyOn(rack, 'transformSpecialChar').and.returnValue('');
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).not.toHaveBeenCalled();
            expect(transFormSpecialCharSpy).toHaveBeenCalledWith(randomLetter);
        });

        it('should not execute the command if the transformed letter is a space', () => {
            const transFormSpecialCharSpy = spyOn(rack, 'transformSpecialChar').and.returnValue(' ');
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).not.toHaveBeenCalled();
            expect(transFormSpecialCharSpy).toHaveBeenCalledWith(randomLetter);
        });

        it('should execute the command if the rack have the letter', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).toHaveBeenCalled();
        });

        it('should set the letter of the selectedTile to the transformed letter', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter);
            expect(executeCommandSpy).toHaveBeenCalled();
            expect(placeLetterInfo1.letter).toEqual(randomLetter);
        });

        it('should set the letter of the selectedTile to the transformed letter even if it is upperCase', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            commandInvokerService.selectedTile = placeLetterInfo1;
            service.placeLetterInBoard(randomLetter.toUpperCase());
            expect(executeCommandSpy).toHaveBeenCalled();
            expect(placeLetterInfo1.letter).toEqual(randomLetter.toUpperCase());
        });
    });

    describe('removeAllViewLetter', () => {
        it('should call removeAllViewLetters and removeLetterTile', () => {
            const removeAllViewLettersSpy = spyOn(commandInvokerService, 'removeAllViewLetters');
            service.removeAllViewLetters();
            expect(removeAllViewLettersSpy).toHaveBeenCalled();
        });

        it('should call removeLetterTile if there is a selectedTile', () => {
            commandInvokerService.selectedTile = placeLetterInfo1;
            const removeLetterTileSpy = spyOn(placementViewTileService, 'removeLetterTile');
            service.removeAllViewLetters();
            expect(removeLetterTileSpy).toHaveBeenCalled();
        });
    });

    describe('placement tests', () => {
        it('should call removeItems on removePlacementCommands', () => {
            const removeItemSpy = spyOn(sessionStorageService, 'removeItem');
            service.removePlacementCommands();
            expect(removeItemSpy).toHaveBeenCalledWith('placementCommands');
        });
    });

    describe('drawWord and PlacementValidation tests', () => {
        let addPlacementCommandSpy: jasmine.Spy;
        beforeEach(() => {
            addPlacementCommandSpy = spyOn(service as any, 'addPlacementCommand');
        });
        it('placementValidation should not draw word with an empty word with vertical direction', () => {
            expect(servicePrivateAccess.placementValidation('', RANDOM_VALID_CASE, RANDOM_VALID_CASE, Direction.Vertical)).toEqual(
                new BoardMessage('Invalid word', 'Empty word provided'),
            );
        });
        it('drawWord should draw word with horizontal direction', () => {
            service.drawWord('Bonjour', RANDOM_VALID_CASE, RANDOM_VALID_CASE, Direction.Horizontal);
            expect(addPlacementCommandSpy).toHaveBeenCalledWith('Bonjour', { x: RANDOM_VALID_CASE, y: RANDOM_VALID_CASE }, Direction.Horizontal);
        });
        it('drawWord should draw word with vertical direction', () => {
            service.drawWord('Bonjour', RANDOM_VALID_CASE, RANDOM_VALID_CASE, Direction.Vertical);
            expect(addPlacementCommandSpy).toHaveBeenCalledWith('Bonjour', { x: RANDOM_VALID_CASE, y: RANDOM_VALID_CASE }, Direction.Vertical);
        });
        it('drawWord should skip case if it is a star case', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- we need them for indexes
            service.drawWord('Hello', 6, 8, Direction.Horizontal);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- we need them for indexes
            expect(addPlacementCommandSpy).toHaveBeenCalledWith('Hello', { x: 6, y: 8 }, Direction.Horizontal);
        });
        it('placementValidation should call drawLetter if direction is undefined', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', RANDOM_VALID_CASE, RANDOM_VALID_CASE)).toEqual(
                new BoardMessage('Invalid placement', 'No direction provided'),
            );
        });
        it('placementValidation should call drawLetter if direction is undefined', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', RANDOM_VALID_CASE, RANDOM_VALID_CASE, '')).toEqual(
                new BoardMessage('Invalid placement', 'No direction provided'),
            );
        });
        it('placementValidation should not draw when xPosition is lower than 0', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', RANDOM_INVALID_CASE, RANDOM_VALID_CASE, Direction.Vertical)).toEqual(
                new BoardMessage('Invalid placement', 'Invalid row/column'),
            );
        });
        it('placementValidation should not draw when yPosition is lower than 0', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', RANDOM_VALID_CASE, RANDOM_INVALID_CASE, Direction.Vertical)).toEqual(
                new BoardMessage('Invalid placement', 'Invalid row/column'),
            );
        });
        it('placementValidation should not draw when xPosition is higher than tile number', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', INVALID_TILE, RANDOM_VALID_CASE, Direction.Vertical)).toEqual(
                new BoardMessage('Invalid placement', 'Invalid row/column'),
            );
        });
        it('drawWordValidation should not draw when yPosition is higher than tile number', () => {
            expect(servicePrivateAccess.placementValidation('Bonjour', RANDOM_VALID_CASE, INVALID_TILE, Direction.Vertical)).toEqual(
                new BoardMessage('Invalid placement', 'Invalid row/column'),
            );
        });
        it('should call cancelTilePlacementCommand if it draws a letter on a tile selected for BOARD placement', () => {
            const startingPosition: Position = { x: RANDOM_VALID_CASE, y: RANDOM_VALID_CASE };
            servicePrivateAccess.lettersInBoard[startingPosition.x][startingPosition.y].updateSelectionType(SelectionType.BOARD);
            const cancelTilePlacementSpy = spyOn(commandInvokerService, 'cancelTilePlacementCommand');
            service.drawWord('Bonjour', startingPosition.x, startingPosition.y, Direction.Horizontal);
            expect(cancelTilePlacementSpy).toHaveBeenCalledWith(servicePrivateAccess.lettersInBoard[startingPosition.x][startingPosition.y]);
        });
    });

    describe('canBeFocused() tests', () => {
        let position: Position;
        beforeEach(() => {
            position = { x: 2, y: 2 };
        });
        it('should return false when the position is the first row or column', () => {
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(true);
            expect(service.canBeFocused(position)).toBeFalse();
        });
        it('should return false when the tile"s content is not empty', () => {
            tile.content = 'a';
            spyOn(service, 'getCaseIndex' as any).and.returnValue(position);
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeFalse();
        });
        it('should return false when the tile"s content is empty', () => {
            tile.content = '';
            spyOn(service, 'getCaseIndex' as any).and.returnValue(position);
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeTrue();
        });
        it('should return true when the tile"s content is empty and it is not on the first row/column', () => {
            tile.content = '';
            spyOn(service, 'getCaseIndex' as any).and.returnValue(position);
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeTrue();
        });
    });

    it('should not call drawLetterTile if the tile content is empty', () => {
        const spy = spyOn(letterTileService, 'drawLetterTile');
        servicePrivateAccess.drawLetterTile(tile);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should add 1 to xPosition when direction is horizontal', () => {
        const xPosition = 1;
        const yPosition = 1;
        const position: Position = { x: xPosition, y: yPosition };
        servicePrivateAccess.updatePosition(Direction.Horizontal, position);
        expect(position.x).toBe(xPosition + 1);
        expect(position.y).toBe(yPosition);
    });
    it('should add 1 to yPosition when direction is vertical', () => {
        const xPosition = 1;
        const yPosition = 1;
        const position: Position = { x: xPosition, y: yPosition };
        servicePrivateAccess.updatePosition(Direction.Vertical, position);
        expect(position.x).toBe(xPosition);
        expect(position.y).toBe(yPosition + 1);
    });

    it('should add the command to placementCommand on drawWord', () => {
        const previousLength = servicePrivateAccess.placementCommands.length;
        const spy = spyOn(sessionStorageService, 'setItem');
        service.drawWord('Bonjour', RANDOM_VALID_CASE, RANDOM_VALID_CASE, Direction.Horizontal);
        expect(spy).toHaveBeenCalled();
        expect(servicePrivateAccess.placementCommands.length).toEqual(previousLength + 1);
        expect(servicePrivateAccess.placementCommands[0].word).toEqual('Bonjour');
        expect(servicePrivateAccess.placementCommands[0].xPosition).toEqual(RANDOM_VALID_CASE);
        expect(servicePrivateAccess.placementCommands[0].yPosition).toEqual(RANDOM_VALID_CASE);
        expect(servicePrivateAccess.placementCommands[0].direction).toEqual(Direction.Horizontal);
    });

    it('should use the session storage items to redraw the lettersTile', (done) => {
        const placementCommand = {
            word: 'Mot',
            xPosition: 3,
            yPosition: 3,
            direction: Direction.Horizontal,
        };

        const getPlacementCommandStub = spyOn(sessionStorageService, 'getPlacementCommands').and.returnValue([placementCommand, placementCommand]);
        const sessionStoragePlacementLength = sessionStorageService.getPlacementCommands('placementCommands').length;
        const setItemSpy = spyOn(sessionStorageService, 'setItem');
        const drawWordSpy = spyOn(servicePrivateAccess, 'drawWord').and.callThrough();
        servicePrivateAccess.redrawLettersTile();

        expect(getPlacementCommandStub).toHaveBeenCalled();
        expect(setItemSpy).toHaveBeenCalled();
        expect(drawWordSpy).toHaveBeenCalled();
        expect(servicePrivateAccess.placementCommands).toEqual([placementCommand, placementCommand]);
        expect(servicePrivateAccess.placementCommands.length).toEqual(sessionStoragePlacementLength);
        done();
    });
});
