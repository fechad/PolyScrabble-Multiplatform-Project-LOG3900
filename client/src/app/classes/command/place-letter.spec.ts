/* eslint-disable max-lines */ // Lot of tests to make sure that place-letter command work fine
/* eslint-disable dot-notation */ // we need private attribute to tests some methods
/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to test private methods
import { PlaceLetter } from '@app/classes/command/place-letter';
import { PlaceLetterInfo } from '@app/classes/place-letter-info';
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { BOARD_SCALING_RATIO, DEFAULT_CASE_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/board-constants';
import { ERROR, RACK_CAPACITY } from '@app/constants/rack-constants';
import { DOWN_ARROW, RIGHT_ARROW } from '@app/enums/tile-constants';
import { LetterTileService } from '@app/services/letter-tile.service';
import { PlacementViewTilesService } from '@app/services/placement-view-tiles.service';
import { RackGridService } from '@app/services/rack-grid.service';

describe('Place-letter tests', () => {
    let placeLetter: PlaceLetter;
    let arrowDirection: string;
    let isFirstPlaced: boolean;
    let placementViewTileService: PlacementViewTilesService;
    let placeLetterInfo: PlaceLetterInfo;
    let letterTileService: LetterTileService;
    let rackGridService: RackGridService;
    beforeEach(() => {
        arrowDirection = RIGHT_ARROW;
        isFirstPlaced = true;
        rackGridService = new RackGridService();
        letterTileService = new LetterTileService();
        placementViewTileService = new PlacementViewTilesService();
        const boardTileWidth = DEFAULT_WIDTH / DEFAULT_CASE_COUNT;
        const boardTileHeight = DEFAULT_HEIGHT / DEFAULT_CASE_COUNT;
        const letterRatio = BOARD_SCALING_RATIO;
        placeLetterInfo = {
            lettersInBoard: new Array<Tile[]>(),
            rack: new Rack(letterTileService, rackGridService),
            tile: new Tile(),
            dimension: { width: boardTileWidth, height: boardTileHeight, letterRatio },
            letter: 'h',
            indexes: { x: 0, y: 0 },
        };
        placeLetter = new PlaceLetter(placementViewTileService, placeLetterInfo, arrowDirection, isFirstPlaced);
    });

    it('should create', () => {
        expect(placeLetter).toBeTruthy();
    });
    it('should return nextPlaceLetterInfo', () => {
        const placeLetterPrivateAccess = placeLetter as any;
        expect(placeLetterPrivateAccess.getNextPlaceInfo()).toEqual(placeLetterPrivateAccess.nextPlaceInfo);
    });
    describe('execute() tests', () => {
        it('should return if tile is undefined', () => {
            const undefinedTile: any = undefined;
            placeLetter.getPlaceInfo().tile = undefinedTile;
            expect(placeLetter.execute()).toEqual(undefined);
        });
        it('should call selectNextCase() ', () => {
            const spy = spyOn(placeLetter as any, 'selectNextCase').and.callFake(() => {
                return;
            });
            placeLetter.execute();
            expect(spy).toHaveBeenCalled();
        });
        it('should call setExecutionTileSettings() ', () => {
            placeLetter.arrowDirection = 'fakeDirection';
            const spy = spyOn(placeLetter as any, 'setExecutionTileSettings').and.callFake(() => {
                return;
            });
            placeLetter.execute();
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeLetterTile() ', () => {
            placeLetter.arrowDirection = 'fakeDirection';
            const spy = spyOn(placementViewTileService as any, 'removeLetterTile').and.callFake(() => {
                return;
            });
            placeLetter.execute();
            expect(spy).toHaveBeenCalled();
        });
        it('should call drawLetterTile() ', () => {
            placeLetter.arrowDirection = 'fakeDirection';
            const spy = spyOn(placementViewTileService as any, 'drawLetterTile').and.callFake(() => {
                return;
            });
            placeLetter.execute();
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeLetterOnRack() ', () => {
            placeLetter.arrowDirection = 'fakeDirection';
            const spy = spyOn(placeLetter as any, 'removeLetterOnRack').and.callThrough();
            placeLetter.execute();
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('cancel() tests', () => {
        it('should call setCancelTileSettings() ', () => {
            const spy = spyOn(placeLetter as any, 'setCancelTileSettings').and.callFake(() => {
                return;
            });
            placeLetter.cancel();
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeNextLetterTile() ', () => {
            const spy = spyOn(placeLetter as any, 'removeNextLetterTile').and.callFake(() => {
                return;
            });
            placeLetter.cancel();
            expect(spy).toHaveBeenCalled();
        });
        it('should call handleEdgePositionOnCancel()and handleFirstTilePlacedCancel() if nextPlaceLetterInfo is undefined ', () => {
            const spy1 = spyOn(placeLetter as any, 'handleEdgePositionOnCancel').and.callFake(() => {
                return;
            });
            const spy2 = spyOn(placeLetter as any, 'handleFirstTilePlacedCancel').and.callFake(() => {
                return;
            });
            placeLetter.cancel();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
        it('should call removeLetterTile() if nextPlaceLetterInfo is not undefined ', () => {
            const spy1 = spyOn(placementViewTileService as any, 'removeLetterTile');
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetter.cancel();
            expect(spy1).toHaveBeenCalled();
        });
        it('should call decrementNextLetterPosition() if nextPlaceLetterInfo is not undefined ', () => {
            const spy1 = spyOn(placeLetter as any, 'decrementNextLetterPosition');
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetter.cancel();
            expect(spy1).toHaveBeenCalled();
        });
        it('should call handleFirstTilePlacedCancel() if it is firstPlaced', () => {
            const spy1 = spyOn(placeLetter as any, 'handleFirstTilePlacedCancel');
            const spy2 = spyOn(placementViewTileService as any, 'drawArrow');
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetter.cancel();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });
        it('should call drawArrow() if it is not firstPlaced', () => {
            const spy1 = spyOn(placeLetter as any, 'handleFirstTilePlacedCancel');
            const spy2 = spyOn(placementViewTileService as any, 'drawArrow');
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetter['isFirstPlaced'] = false;
            placeLetter.cancel();
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });
    describe('forceCancel() tests', () => {
        it('should call addLetterOnRack(), removeLetterTile(),reinitializeContents()', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy1 = spyOn(placeLetterPrivateAccess, 'addLetterOnRack');
            const spy2 = spyOn(placementViewTileService, 'removeLetterTile');
            const spy3 = spyOn(placeLetterPrivateAccess.tile, 'reinitializeContents');
            placeLetterPrivateAccess.forceCancel();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(spy3).toHaveBeenCalled();
        });
    });
    describe('decrementNextLetterPosition() tests', () => {
        it('should update this.tile position.x if arrowDirection is right', () => {
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            const x = placeLetter['nextPlaceLetterInfo'].indexes.x;
            placeLetter.arrowDirection = RIGHT_ARROW;
            placeLetter.decrementNextLetterPosition();
            expect(placeLetter['nextPlaceLetterInfo'].indexes.x).toEqual(x - 1);
        });
        it('should update this.tile position.y if arrowDirection is down', () => {
            placeLetter['nextPlaceLetterInfo'] = placeLetterInfo;
            const y = placeLetter['nextPlaceLetterInfo'].indexes.y;
            placeLetter.arrowDirection = DOWN_ARROW;
            placeLetter.decrementNextLetterPosition();
            expect(placeLetter['nextPlaceLetterInfo'].indexes.y).toEqual(y - 1);
        });
    });
    describe('handleFirstTilePlacedCancel() tests', () => {
        it('should reinitialize content of tile if it is the first placed', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess['isFirstPlaced'] = true;
            placeLetterPrivateAccess.handleFirstTilePlacedCancel();
            expect(placeLetterPrivateAccess['tile'].content).toEqual('');
            expect(placeLetterPrivateAccess['tile'].points).toEqual(ERROR);
        });
        it('should not reinitialize content of tile if it is not the first placed', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess.tile, 'reinitializeContents');
            placeLetterPrivateAccess['isFirstPlaced'] = false;
            placeLetterPrivateAccess.handleFirstTilePlacedCancel();
            expect(spy).not.toHaveBeenCalled();
        });
    });
    describe('handleEdgePositionOnCancel() tests', () => {
        it('should call removeLetterTile if nextPlaceLetterInfo is undefined', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placementViewTileService, 'removeLetterTile');
            placeLetterPrivateAccess['nextPlaceLetterInfo'] = undefined;
            placeLetterPrivateAccess.handleEdgePositionOnCancel();
            expect(spy).toHaveBeenCalled();
        });
        it('should call handleFirstTilePlacedCancel if it is first Placed', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess['isFirstPlaced'] = true;
            const spy1 = spyOn(placeLetterPrivateAccess, 'handleFirstTilePlacedCancel');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.handleEdgePositionOnCancel();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });
        it('should call drawArrow if it is not first Placed', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess['isFirstPlaced'] = false;
            const spy1 = spyOn(placeLetterPrivateAccess, 'handleFirstTilePlacedCancel');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.handleEdgePositionOnCancel();
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });
    describe('getDimensionToRemove() tests', () => {
        it('should update height of dimension to remove ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = DOWN_ARROW;
            const removeDimension = { ...placeLetterPrivateAccess['dimension'] };
            removeDimension.height += placeLetterPrivateAccess.dimension.height * RACK_CAPACITY;
            expect(placeLetterPrivateAccess.getDimensionToRemove()).toEqual(removeDimension);
        });
        it('should update width of dimension to remove ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = RIGHT_ARROW;
            const removeDimension = { ...placeLetterPrivateAccess['dimension'] };
            removeDimension.width += placeLetterPrivateAccess.dimension.width * RACK_CAPACITY;
            expect(placeLetterPrivateAccess.getDimensionToRemove()).toEqual(removeDimension);
        });
    });
    describe('addLetterOnRack() tests', () => {
        it('should call addLetter ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess.rack, 'addLetter');
            placeLetterPrivateAccess.addLetterOnRack();
            expect(spy).toHaveBeenCalled();
        });
        it('should call addLetter with * as a parameter if upperCase ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess.rack, 'addLetter');
            placeLetterPrivateAccess['placeLetterInfo']['letter'] = 'H';
            placeLetterPrivateAccess.addLetterOnRack();
            expect(spy).toHaveBeenCalledWith('*');
        });
    });
    describe('removeLetterOnRack() tests', () => {
        it('should call removeLetter ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess.rack, 'removeLetter');
            placeLetterPrivateAccess.removeLetterOnRack();
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeLetter with * as a parameter is upperCase ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess.rack, 'removeLetter');
            placeLetterPrivateAccess['placeLetterInfo']['letter'] = 'H';
            placeLetterPrivateAccess.addLetterOnRack();
            placeLetterPrivateAccess.removeLetterOnRack();
            expect(spy).toHaveBeenCalledWith('*');
        });
    });
    describe('removeNextLetterTile() tests', () => {
        it('should call addLetterOnRack ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy = spyOn(placeLetterPrivateAccess, 'addLetterOnRack');
            placeLetterPrivateAccess.removeNextLetterTile();
            expect(spy).toHaveBeenCalled();
        });
        it('should call removeLetter if it has arrow as content ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetterPrivateAccess['nextPlaceLetterInfo']['tile'].content = RIGHT_ARROW;
            const spy = spyOn(placementViewTileService, 'removeLetterTile');
            placeLetterPrivateAccess.removeNextLetterTile();
            expect(spy).toHaveBeenCalled();
        });
        it('should not set content to empty ', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess['nextPlaceLetterInfo'] = placeLetterInfo;
            placeLetterPrivateAccess['nextPlaceLetterInfo']['tile'].content = 'h';
            const x = placeLetterPrivateAccess['nextPlaceLetterInfo']['tile'].content;
            placeLetterPrivateAccess.removeNextLetterTile();
            expect(x).not.toEqual('');
        });
    });
    describe('selectNextCase() tests', () => {
        it('should not call drawArrow if xIndex + 1 > 15', () => {
            const spy = spyOn(placementViewTileService, 'drawArrow');
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = RIGHT_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.x = 20;
            placeLetterPrivateAccess.selectNextCase();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call drawArrow if xIndex + 1 < 15 but nextTile is undefined', () => {
            const spy = spyOn(placementViewTileService, 'drawArrow');
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = RIGHT_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.x = 1;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1][placeLetterPrivateAccess.yIndex] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1][placeLetterPrivateAccess.yIndex] = undefined;
            placeLetterPrivateAccess.selectNextCase();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should  call drawArrow if xIndex + 1 < 15 but nextTile is not undefined', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy1 = spyOn(placeLetterPrivateAccess, 'updatePlaceLetterInfo');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.arrowDirection = RIGHT_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.x = 1;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1][placeLetterPrivateAccess.yIndex] = new Tile();

            placeLetterPrivateAccess.selectNextCase();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });

        it('should  call drawArrow if xIndex + 1 < 15 but nextTile has a content horizontally', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy1 = spyOn(placeLetterPrivateAccess, 'updatePlaceLetterInfo');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.arrowDirection = RIGHT_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.x = 1;
            const tileWithContent = new Tile();
            tileWithContent.content = 'a';
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 2] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 1][placeLetterPrivateAccess.yIndex] = tileWithContent;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex + 2][placeLetterPrivateAccess.yIndex] = new Tile();

            placeLetterPrivateAccess.selectNextCase();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
        it('should not call drawArrow if yIndex + 1 > 15', () => {
            const spy = spyOn(placementViewTileService, 'drawArrow');
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = DOWN_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.y = 20;
            placeLetterPrivateAccess.selectNextCase();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call drawArrow if yIndex + 1 < 15 but nextTile is undefined', () => {
            const spy = spyOn(placementViewTileService, 'drawArrow');
            const placeLetterPrivateAccess = placeLetter as any;
            placeLetterPrivateAccess.arrowDirection = DOWN_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.y = 1;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex][placeLetterPrivateAccess.yIndex + 1] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex][placeLetterPrivateAccess.yIndex + 1] = undefined;
            placeLetterPrivateAccess.selectNextCase();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should  call drawArrow if yIndex + 1 < 15 but nextTile is not undefined', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy1 = spyOn(placeLetterPrivateAccess, 'updatePlaceLetterInfo');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.arrowDirection = DOWN_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.y = 1;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex][placeLetterPrivateAccess.yIndex + 1] = new Tile();

            placeLetterPrivateAccess.selectNextCase();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
        it('should  call drawArrow if xIndex + 1 < 15 but nextTile has a content vertically', () => {
            const placeLetterPrivateAccess = placeLetter as any;
            const spy1 = spyOn(placeLetterPrivateAccess, 'updatePlaceLetterInfo');
            const spy2 = spyOn(placementViewTileService, 'drawArrow');
            placeLetterPrivateAccess.arrowDirection = DOWN_ARROW;
            placeLetterPrivateAccess['placeLetterInfo'].indexes.y = 1;
            const tileWithContent = new Tile();
            tileWithContent.content = 'a';
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex] = new Tile();
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex][placeLetterPrivateAccess.yIndex + 1] = tileWithContent;
            placeLetterPrivateAccess.lettersInBoard[placeLetterPrivateAccess.xIndex][placeLetterPrivateAccess.yIndex + 2] = new Tile();

            placeLetterPrivateAccess.selectNextCase();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });
});
