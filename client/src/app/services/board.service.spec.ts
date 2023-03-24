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
import { SessionStorageService } from '@app/services/session-storage.service';
import { BoardService } from './board.service';
import { CommandInvokerService } from './command-invoker.service';

const RANDOM_VALID_CASE = 5;
const RANDOM_INVALID_CASE = -2;
const INVALID_TILE = 16;

describe('BoardService', () => {
    const randomLetter = 'a';

    let service: BoardService;
    let placeLetterInfo1: PlaceLetterInfo;
    let placeLetterInfo2: PlaceLetterInfo;
    let tile: Tile;
    let tile2: Tile;
    let rack: Rack;

    let sessionStorageService: SessionStorageService;
    let commandInvokerService: CommandInvokerService;

    let servicePrivateAccess: any;

    beforeEach(async () => {
        sessionStorageService = new SessionStorageService();
        commandInvokerService = new CommandInvokerService();
        rack = new Rack();
        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: SessionStorageService, useValue: sessionStorageService },
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

        service.initializeBoardService({ width: tile.width, height: tile.height, letterRatio: BOARD_SCALING_RATIO });
        servicePrivateAccess = service as any;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('mouseHitDetect tests', () => {
        const mousePosition: Position = { x: 300, y: 300 };
        it('should not detect any new hit if commandInvoker.canSelectFirstCaseForPlacement is false', () => {
            const spy = spyOn(service as any, 'updateSelectedTileOnMouseHitDetect');
            commandInvokerService.canSelectFirstCaseForPlacement = false;
            service.mouseHitDetect(mousePosition);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should set the previousTile to empty string if the new selectedTile is not the same', () => {
            placeLetterInfo1.tile.content = randomLetter;
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo2);
            commandInvokerService.selectedTile = placeLetterInfo1;

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalled();
            expect(placeLetterInfo1.tile.content).toEqual('');
        });

        it('should set selectedTile to undefined if the tile is not empty and not an arrow', () => {
            commandInvokerService.selectedTile = placeLetterInfo1;
            placeLetterInfo1.tile.content = randomLetter;
            placeLetterInfo2.tile.content = randomLetter;
            spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo2);

            const undefinedPlaceLetterInfo: any = undefined;

            service.mouseHitDetect(mousePosition);
            expect(commandInvokerService.selectedTile).toEqual(undefinedPlaceLetterInfo);
        });

        it('should update selectionType and draw the right Arrow if there is no content in the tile', () => {
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo1);
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalled();
            expect(updateSelectionSpy).toHaveBeenCalledWith(SelectionType.BOARD);
            expect(tile.content).toEqual(RIGHT_ARROW);
        });

        it('should update selectionType and draw the correct Arrow if there is an arrow in the tile', () => {
            placeLetterInfo1.tile.content = RIGHT_ARROW;
            const getSelectedTileSpy = spyOn(service as any, 'getSelectedTile').and.returnValue(placeLetterInfo1);
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();

            service.mouseHitDetect(mousePosition);
            expect(getSelectedTileSpy).toHaveBeenCalled();
            expect(updateSelectionSpy).toHaveBeenCalledWith(SelectionType.BOARD);
            expect(tile.content).toEqual(DOWN_ARROW);
        });

        it('should not update selectionType and draw the correct Arrow if the mouse position is inTheFirstRow or Column', () => {
            const invalidMousePosition = { x: 0, y: 0 };
            const updateSelectionSpy = spyOn(tile, 'updateSelectionType').and.callThrough();

            service.mouseHitDetect(invalidMousePosition);
            expect(updateSelectionSpy).not.toHaveBeenCalledWith(SelectionType.BOARD);
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
    });

    describe('placement tests', () => {
        it('should call removeItems on removePlacementCommands', () => {
            const removeItemSpy = spyOn(sessionStorageService, 'removeItem');
            service.removePlacementCommands();
            expect(removeItemSpy).toHaveBeenCalledWith('placementCommands');
        });
    });

    describe('matchRowNumber tests', () => {
        it('matchRow should match the letter given to the index ', () => {
            const result = 15;
            expect(service.matchRowNumber('o')).toEqual(result);
        });
        it('matchRow should return undefined if an empty string is given ', () => {
            expect(service.matchRowNumber('')).toBe(undefined);
        });
        it('matchRow should return undefined if a letter upper than o is given ', () => {
            expect(service.matchRowNumber('w')).toBe(undefined);
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
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeFalse();
        });
        it('should return false when the tile"s content is empty', () => {
            tile.content = '';
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeTrue();
        });
        it('should return true when the tile"s content is empty and it is not on the first row/column', () => {
            tile.content = '';
            // eslint-disable-next-line dot-notation -- we need to access private attribute
            service['lettersInBoard'][position.x][position.y] = tile;
            spyOn(service, 'isFirstRowOrColumn' as any).and.returnValue(false);
            expect(service.canBeFocused(position)).toBeTrue();
        });
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
});
