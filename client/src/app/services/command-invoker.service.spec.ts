/* eslint-disable dot-notation */ // we want to access private attribute
import { TestBed } from '@angular/core/testing';
import { BOARD_SCALING_RATIO, DEFAULT_CASE_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/board-constants';
import { PlaceLetter } from '@app/classes/command/place-letter';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { CommandInvokerService } from './command-invoker.service';
import { LetterTileService } from './letter-tile.service';
import { PlacementViewTilesService } from './placement-view-tiles.service';
import { RackGridService } from './rack-grid.service';

describe('CommandInvokerService', () => {
    let service: CommandInvokerService;

    let placeLetter1: PlaceLetter;
    let placeLetter2: PlaceLetter;
    let arrowDirection: string;
    let isFirstPlaced: boolean;
    let placementViewTileService: PlacementViewTilesService;
    let placeLetterInfo1: PlaceLetterInfo;
    let placeLetterInfo2: PlaceLetterInfo;
    let letterTileService: LetterTileService;
    let rackGridService: RackGridService;
    let tile1: Tile;
    let tile2: Tile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommandInvokerService);

        arrowDirection = RIGHT_ARROW;
        isFirstPlaced = true;
        rackGridService = new RackGridService();
        letterTileService = new LetterTileService();

        const boardTileWidth = DEFAULT_WIDTH / DEFAULT_CASE_COUNT;
        const boardTileHeight = DEFAULT_HEIGHT / DEFAULT_CASE_COUNT;
        const letterRatio = BOARD_SCALING_RATIO;

        tile1 = new Tile();
        tile1.content = 'a';
        tile2 = new Tile();
        tile2.content = 'b';

        placeLetterInfo1 = {
            lettersInBoard: new Array<Tile[]>(),
            rack: new Rack(letterTileService, rackGridService),
            tile: tile1,
            dimension: { width: boardTileWidth, height: boardTileHeight, letterRatio },
            letter: tile1.content,
            indexes: { x: 0, y: 0 },
        };

        placeLetterInfo2 = {
            lettersInBoard: new Array<Tile[]>(),
            rack: new Rack(letterTileService, rackGridService),
            tile: tile2,
            dimension: { width: boardTileWidth, height: boardTileHeight, letterRatio },
            letter: tile2.content,
            indexes: { x: 0, y: 1 },
        };

        placeLetter1 = new PlaceLetter(placementViewTileService, placeLetterInfo1, arrowDirection, isFirstPlaced);
        placeLetter2 = new PlaceLetter(placementViewTileService, placeLetterInfo2, arrowDirection, isFirstPlaced);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have canSelectFirstCaseForPlacement as true when created', () => {
        expect(service.canSelectFirstCaseForPlacement).toBeTruthy();
    });

    describe('commandMessage tests', () => {
        it('should return a command message with a good syntax horizontally', () => {
            service.firstSelectedCaseForPlacement = 'a1';
            placeLetter1.arrowDirection = RIGHT_ARROW;
            placeLetter2.arrowDirection = RIGHT_ARROW;
            service['cancelStack'] = [placeLetter1, placeLetter2];
            expect(service.commandMessage).toEqual('!placer a1h ab');
        });

        it('should return a command message with a good syntax vertically', () => {
            service.firstSelectedCaseForPlacement = 'a1';
            placeLetter1.arrowDirection = DOWN_ARROW;
            placeLetter2.arrowDirection = DOWN_ARROW;
            service['cancelStack'] = [placeLetter1, placeLetter2];
            expect(service.commandMessage).toEqual('!placer a1v ab');
        });

        it('should return an empty string if the cancelStack is empty', () => {
            service.firstSelectedCaseForPlacement = 'a1';
            expect(service.commandMessage).toEqual('');
        });
    });

    describe('executeCommand tests', () => {
        let executeSpy: jasmine.Spy;
        beforeEach(() => {
            executeSpy = spyOn(placeLetter1, 'execute');
        });

        it('should execute the command on executeCommand', () => {
            service.executeCommand(placeLetter1);
            expect(executeSpy).toHaveBeenCalled();
        });

        it('should add the command in the cancel stack on execute', () => {
            const previousCancelStackLength = service['cancelStack'].length;
            service.executeCommand(placeLetter1);
            expect(service['cancelStack'].length).toEqual(previousCancelStackLength + 1);
        });

        it('should set canSelectFirstCaseForPlacement to false on executeCommand', () => {
            service.executeCommand(placeLetter1);
            expect(service.canSelectFirstCaseForPlacement).toBeFalsy();
        });

        it('should change the selected tile to the next tile on executeCommand', () => {
            const getNextPlaceInfoSpy = spyOn(placeLetter1, 'getNextPlaceInfo').and.returnValue(placeLetterInfo2);
            service.executeCommand(placeLetter1);
            expect(getNextPlaceInfoSpy).toHaveBeenCalled();
            expect(service.selectedTile).toEqual(placeLetterInfo2);
        });
    });

    describe('cancel tests', () => {
        let placeLetter2CancelSpy: jasmine.Spy;
        beforeEach(() => {
            placeLetter2CancelSpy = spyOn(placeLetter2, 'cancel');
        });

        it('should not cancel if the cancelStack.length <= 0', () => {
            const cancelStackPopSpy = spyOn(service['cancelStack'], 'pop');
            service.cancel();
            expect(cancelStackPopSpy).not.toHaveBeenCalled();
        });

        it('should cancel the correct command on cancel', () => {
            service['cancelStack'] = [placeLetter1, placeLetter2];
            const cancelStackPopSpy = spyOn(service['cancelStack'], 'pop').and.callThrough();
            service.cancel();
            expect(cancelStackPopSpy).toHaveBeenCalled();
            expect(placeLetter2CancelSpy).toHaveBeenCalled();
        });

        it('should set the selectedTile correctly on cancel', () => {
            service['cancelStack'] = [placeLetter1, placeLetter2];
            const getPlaceInfoSpy = spyOn(placeLetter2, 'getPlaceInfo').and.returnValue(placeLetterInfo2);
            service.cancel();
            expect(getPlaceInfoSpy).toHaveBeenCalled();
            expect(service.selectedTile).toEqual(placeLetterInfo2);
        });

        it('should reset the state of some attribute if cancelStack.length <= 0 after the pop', () => {
            service['cancelStack'] = [placeLetter2];
            const getPlaceInfoSpy = spyOn(placeLetter2, 'getPlaceInfo').and.returnValue(placeLetterInfo2);
            service.cancel();
            expect(getPlaceInfoSpy).toHaveBeenCalled();
            expect(placeLetter2.isFirstPlaced).toEqual(true);
            expect(service.canSelectFirstCaseForPlacement).toEqual(true);
            expect(service.selectedTile).toEqual(undefined);
        });
    });

    describe('removeAllViewLetters tests', () => {
        it('should cancel every commands of the cancelStack', () => {
            service['cancelStack'] = [placeLetter1, placeLetter2];
            const cancel1Spy = spyOn(placeLetter1, 'cancel');
            const cancel2Spy = spyOn(placeLetter2, 'cancel');
            service.removeAllViewLetters();
            expect(service['cancelStack'].length).toEqual(0);
            expect(cancel1Spy).toHaveBeenCalled();
            expect(cancel2Spy).toHaveBeenCalled();
        });
    });

    describe('cancelTilePlacementCommand tests', () => {
        let forceCancel2Spy: jasmine.Spy;
        beforeEach(() => {
            forceCancel2Spy = spyOn(placeLetter2, 'forceCancel');
        });

        it('should not forceCancel if the tile is in not in one of the cancelStack command info', () => {
            service['cancelStack'] = [placeLetter1];
            service.cancelTilePlacementCommand(tile2);
            expect(forceCancel2Spy).not.toHaveBeenCalled();
        });

        it('should forceCancel if the tile exist in one of the cancelStack Command info', () => {
            service['cancelStack'] = [placeLetter1, placeLetter2];
            const previousCancelStackLength = service['cancelStack'].length;
            service.cancelTilePlacementCommand(tile2);
            expect(forceCancel2Spy).toHaveBeenCalled();
            expect(service['cancelStack'].length).toEqual(previousCancelStackLength - 1);
        });

        it('it should call decrementNextLetterPosition of the previousCommand if it exists', () => {
            service['cancelStack'] = [placeLetter1, placeLetter2];
            const placeLetter1DecrementSpy = spyOn(placeLetter1, 'decrementNextLetterPosition');
            service.cancelTilePlacementCommand(tile2);
            expect(placeLetter1DecrementSpy).toHaveBeenCalled();
        });

        it('it should not call decrementNextLetterPosition of the previousCommand if it does not exists', () => {
            service['cancelStack'] = [placeLetter2];
            const placeLetter1DecrementSpy = spyOn(placeLetter1, 'decrementNextLetterPosition');
            service.cancelTilePlacementCommand(tile2);
            expect(placeLetter1DecrementSpy).not.toHaveBeenCalled();
        });

        it('should set canSelectFirstCaseForPlacement to true if cancelStack is empty', () => {
            service.canSelectFirstCaseForPlacement = false;
            service['cancelStack'] = [placeLetter2];
            service.cancelTilePlacementCommand(tile2);
            expect(service.canSelectFirstCaseForPlacement).toEqual(true);
        });
    });

    it('getPreviousCommand should return undefined if the command is not in the cancelStack', () => {
        // we want to test a private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const servicePrivateAccess = service as any;
        expect(servicePrivateAccess.getPreviousCommand(placeLetter1)).toEqual(undefined);
    });
});
