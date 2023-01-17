/* eslint-disable max-lines */ // We made a lot of tests to be sure that we are not missing anything
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy on private methods for some tests
/* eslint-disable dot-notation */ // We want to set private attribute of the class for multiple tests
import { Rack } from '@app/classes/rack';
import { Tile } from '@app/classes/tile';
import { ERROR, RACK_CAPACITY } from '@app/constants/rack-constants';
import { Direction } from '@app/enums/direction';
import { SelectionType } from '@app/enums/selection-type';
import { LetterTileService } from '@app/services/letter-tile.service';
import { RackGridService } from '@app/services/rack-grid.service';

describe('Rack', () => {
    let rack: Rack;
    let letterTileService: LetterTileService;
    let rackGridService: RackGridService;
    const lastPositionIndex = 6;
    const firstPositionIndex = 0;
    const randomLetters = '*aebcda';
    const randomLetterInRack = 'b';
    const randomLetterNotInRack = 'f';

    beforeEach(async () => {
        rackGridService = new RackGridService();
        letterTileService = new LetterTileService();
        rack = new Rack(letterTileService, rackGridService);
    });

    it('should create', () => {
        expect(rack).toBeTruthy();
    });

    it('updateRack should call drawRackContent ', () => {
        const spy = spyOn(rack as any, 'drawRackContent');
        rack.updateRack(randomLetters);
        expect(spy).toHaveBeenCalled();
    });

    describe('removeLetter tests', () => {
        it('should set the attribute correctly when removing the letter', () => {
            rack.updateRack(randomLetters);
            const drawRackContentSpy = spyOn(rack as any, 'drawRackContent');
            const letterIndex = rack.rackWord.indexOf(randomLetterInRack);
            rack.removeLetter(randomLetterInRack);

            expect(rack['rack'][letterIndex].content).toEqual(' ');
            expect(rack['rack'][letterIndex].points).toEqual(ERROR);
            expect(drawRackContentSpy).toHaveBeenCalled();
        });

        it('should not remove any letter if it is not in the rack', () => {
            rack.updateRack(randomLetters);
            rack.removeLetter(randomLetterNotInRack);
            const drawRackContentSpy = spyOn(rack as any, 'drawRackContent');
            expect(drawRackContentSpy).not.toHaveBeenCalled();
        });
    });

    describe('addLetter tests', () => {
        it('should add a letter to the rack on the first tile with space as content', () => {
            rack.updateRack(randomLetters);
            rack['rack'][2].content = ' ';
            rack['rack'][RACK_CAPACITY - 1].content = ' ';
            rack.addLetter(randomLetterNotInRack);
            expect(rack['rack'][2].content).toEqual(randomLetterNotInRack);
            expect(rack['rack'][RACK_CAPACITY - 1].content).toEqual(' ');
        });
        it('should call the correct method on addLetter', () => {
            rack.updateRack('welcome');
            rack['rack'][2].content = ' ';
            const updateRackSpy = spyOn(rack, 'updateRack');
            rack.addLetter(randomLetterNotInRack);
            const expectedRackWord = 'wefcome';
            expect(updateRackSpy).toHaveBeenCalledWith(expectedRackWord);
        });
    });

    describe('transformSpecialChar tests', () => {
        it('should return an empty string when trying to transform empty string', () => {
            const response = rack.transformSpecialChar('');
            const result = '';
            expect(response).toEqual(result);
        });
        it('should return an empty string when trying to transform multiple letters', () => {
            const response = rack.transformSpecialChar('axds');
            const result = '';
            expect(response).toEqual(result);
        });
        it('should return "*" when getting an UpperCase', () => {
            const response = rack.transformSpecialChar('É');
            const result = '*';
            expect(response).toEqual(result);
        });
        it('should return u when trying to transform a letter included in SPECIAL_U', () => {
            const response = rack.transformSpecialChar('û');
            const result = 'u';
            expect(response).toEqual(result);
        });
        it('should return o when trying to transform a letter included in SPECIAL_O', () => {
            const response = rack.transformSpecialChar('ô');
            const result = 'o';
            expect(response).toEqual(result);
        });
        it('should return a when trying to transform a letter included in SPECIAL_A', () => {
            const response = rack.transformSpecialChar('â');
            const result = 'a';
            expect(response).toEqual(result);
        });
        it('should return i when trying to transform a letter included in SPECIAL_I', () => {
            const response = rack.transformSpecialChar('î');
            const result = 'i';
            expect(response).toEqual(result);
        });
        it('should return e when trying to transform a letter included in SPECIAL_E', () => {
            const response = rack.transformSpecialChar('è');
            const result = 'e';
            expect(response).toEqual(result);
        });
        it('should return c when trying to transform a letter included in SPECIAL_C', () => {
            const response = rack.transformSpecialChar('ç');
            const result = 'c';
            expect(response).toEqual(result);
        });
    });

    describe('cancelExchange() tests', () => {
        it('should unselect all the tile', () => {
            const tile1: Tile = rack['rack'][0];
            const tile2: Tile = rack['rack'][1];
            tile1.updateSelectionType(SelectionType.EXCHANGE);
            tile2.updateSelectionType(SelectionType.EXCHANGE);
            rack.cancelExchange();
            expect(tile1.typeOfSelection).toEqual(SelectionType.UNSELECTED);
            expect(tile1.typeOfSelection).toEqual(SelectionType.UNSELECTED);
        });

        it('the currentSelectionType should become unselected when it is not the case initially', () => {
            rack['currentSelectionType'] = SelectionType.EXCHANGE;
            rack.cancelExchange();
            expect(rack['currentSelectionType']).toEqual(SelectionType.UNSELECTED);
        });
    });

    describe('areTilesSelectedForExchange() tests', () => {
        it('the tiles should not be selected initially', () => {
            expect(rack.areTilesSelectedForExchange()).toBeFalse();
        });
    });

    describe('moveTile() tests', () => {
        let firstTile: Tile;
        let lastTile: Tile;

        beforeEach(() => {
            for (let i = 0; i < rack['rack'].length; i++) {
                rack['rack'][i].content = i.toString();
            }
            firstTile = rack['rack'][firstPositionIndex];
            lastTile = rack['rack'][lastPositionIndex];
        });

        it('should swap correctly valid index in left direction', () => {
            const validIndex = 4;
            rack['selectedTileIndex'] = validIndex;
            const validIndexTile = rack['rack'][validIndex];
            const tileToSwap = rack['rack'][validIndex - 1];
            rack.moveTile(Direction.Left);

            expect(rack['rack'][validIndex].content).toEqual(tileToSwap.content);
            expect(rack['rack'][validIndex - 1].content).toEqual(validIndexTile.content);
        });

        it('should swap correctly valid index in right direction', () => {
            const validIndex = 2;
            rack['selectedTileIndex'] = validIndex;
            const validIndexTile = rack['rack'][validIndex];
            const tileToSwap = rack['rack'][validIndex + 1];
            rack.moveTile(Direction.Right);

            expect(rack['rack'][validIndex].content).toEqual(tileToSwap.content);
            expect(rack['rack'][validIndex + 1].content).toEqual(validIndexTile.content);
        });

        it('should put the tile to the first position if it was last and was moved right', () => {
            rack['selectedTileIndex'] = lastPositionIndex;
            rack.moveTile(Direction.Right);

            expect(rack['rack'][lastPositionIndex].content).toEqual(firstTile.content);
            expect(rack['rack'][firstPositionIndex].content).toEqual(lastTile.content);
        });

        it('should put the tile to the last position if it was first and was moved left', () => {
            rack['selectedTileIndex'] = firstPositionIndex;
            rack.moveTile(Direction.Left);

            expect(rack['rack'][lastPositionIndex].content).toEqual(firstTile.content);
            expect(rack['rack'][firstPositionIndex].content).toEqual(lastTile.content);
        });

        it('should not swapTile if it receive negative index on left direction', () => {
            const negativeIndex = -5;
            rack['selectedTileIndex'] = negativeIndex;
            rack.moveTile(Direction.Left);

            expect(rack['rack'][firstPositionIndex]).toEqual(firstTile);
            expect(rack['rack'][lastPositionIndex]).toEqual(lastTile);
        });

        it('should not swapTile if it receive negative index on right direction', () => {
            const negativeIndex = -5;
            rack['selectedTileIndex'] = negativeIndex;
            rack.moveTile(Direction.Right);

            expect(rack['rack'][firstPositionIndex]).toEqual(firstTile);
            expect(rack['rack'][lastPositionIndex]).toEqual(lastTile);
        });

        it('should not swapTile if the index is >= to the rack capacity on left direction', () => {
            const invalidIndex = 7;
            rack['selectedTileIndex'] = invalidIndex;
            rack.moveTile(Direction.Left);

            expect(rack['rack'][firstPositionIndex]).toEqual(firstTile);
            expect(rack['rack'][lastPositionIndex]).toEqual(lastTile);
        });

        it('should not swapTile if the index is >= to the rack capacity on right direction', () => {
            const invalidIndex = 7;
            rack['selectedTileIndex'] = invalidIndex;
            rack.moveTile(Direction.Right);

            expect(rack['rack'][firstPositionIndex]).toEqual(firstTile);
            expect(rack['rack'][lastPositionIndex]).toEqual(lastTile);
        });

        it('should not swapTile if the Direction is Invalid', () => {
            rack['selectedTileIndex'] = firstPositionIndex;
            rack.moveTile(Direction.Horizontal);

            expect(rack['rack'][firstPositionIndex]).toEqual(firstTile);
            expect(rack['rack'][lastPositionIndex]).toEqual(lastTile);
        });
    });

    describe('onRightClick() tests', () => {
        it('should select for exchange a tile that is unselected', () => {
            const tile: Tile = rack['rack'][0];
            tile.updateSelectionType(SelectionType.UNSELECTED);
            rack.onRightClick(tile.x, tile.y);
            expect(tile.typeOfSelection).toBe(SelectionType.EXCHANGE);
        });
        it('should select for exchange a tile that is selected for placement', () => {
            const tile: Tile = rack['rack'][0];
            tile.updateSelectionType(SelectionType.PLACEMENT);
            rack.onRightClick(tile.x, tile.y);
            expect(tile.typeOfSelection).toBe(SelectionType.EXCHANGE);
        });
        it('should unselect a tile that is selected for exchange', () => {
            const tile: Tile = rack['rack'][0];
            tile.updateSelectionType(SelectionType.EXCHANGE);
            rack.onRightClick(tile.x, tile.y);
            expect(tile.typeOfSelection).toBe(SelectionType.UNSELECTED);
        });
        it('should not unselect the tiles when the mouse position is not on a tile', () => {
            const tile: Tile = rack['rack'][0];
            tile.updateSelectionType(SelectionType.EXCHANGE);
            rack.onRightClick(tile.x - 1, tile.y);
            expect(tile.typeOfSelection).toBe(SelectionType.EXCHANGE);
        });
    });

    describe('mouseHitDetect tests', () => {
        let mouseEvent: MouseEvent;

        beforeEach(() => {
            mouseEvent = new MouseEvent('click');
        });

        it('should set all the tiles to unselected before selecting a tile for manipulation', () => {
            const updateSelectionTypeSpy = spyOn(rack as any, 'updateSelectionType');

            rack.mouseHitDetect(mouseEvent);
            expect(updateSelectionTypeSpy).toHaveBeenCalledWith(SelectionType.UNSELECTED);
        });
        it('it should set the selected index to ERROR if it clicked on no tile', () => {
            const getTileClickedOnSpy = spyOn(rack as any, 'getTileClickedOn').and.returnValue(false);
            rack.mouseHitDetect(mouseEvent);
            expect(getTileClickedOnSpy).toHaveBeenCalled();
            expect(rack['selectedTileIndex']).toEqual(ERROR);
        });
        it('it should call selectTileForPlacement and setCaseSelectedIndex if it clicked on a tile', () => {
            const indexOfRandomTile = 2;
            const getTileClickedOnSpy = spyOn(rack as any, 'getTileClickedOn').and.returnValue(rack['rack'][indexOfRandomTile]);
            const selectTileForPlacementSpy = spyOn(rack as any, 'selectTileForPlacement');
            const setCaseSelectedIndexSpy = spyOn(rack as any, 'setCaseSelectedIndex').and.callThrough();
            rack.mouseHitDetect(mouseEvent);
            expect(getTileClickedOnSpy).toHaveBeenCalled();
            expect(selectTileForPlacementSpy).toHaveBeenCalledWith(rack['rack'][indexOfRandomTile]);
            expect(setCaseSelectedIndexSpy).toHaveBeenCalled();
        });
    });

    describe('selectLetterTile tests', () => {
        let randomLetter: string;
        let selectTileForPlacementSpy: jasmine.Spy;
        let isAnotherLetterSelectedSpy: jasmine.Spy;
        let selectFirstInstanceOfLetterSpy: jasmine.Spy;
        let selectNextInstanceOfSameLetterSpy: jasmine.Spy;

        beforeEach(() => {
            randomLetter = 'a';
            selectTileForPlacementSpy = spyOn(rack as any, 'selectTileForPlacement').and.callThrough();
            isAnotherLetterSelectedSpy = spyOn(rack as any, 'isAnotherLetterSelected').and.callThrough();
            selectFirstInstanceOfLetterSpy = spyOn(rack as any, 'selectFirstInstanceOfLetter').and.callThrough();
            selectNextInstanceOfSameLetterSpy = spyOn(rack as any, 'selectNextInstanceOfSameLetter').and.callThrough();
            rack['selectedTileIndex'] = ERROR;
        });
        it('should deselect every tiles when selectLetterTile is called', () => {
            const updateSelectionTypeSpy = spyOn(rack as any, 'updateSelectionType');
            rack.selectLetterTile(randomLetter);
            expect(updateSelectionTypeSpy).toHaveBeenCalledWith(SelectionType.UNSELECTED);
        });

        it('should not call selectTileForPlacement if the selected index is undefine', () => {
            rack.selectLetterTile(randomLetterNotInRack);
            expect(selectTileForPlacementSpy).not.toHaveBeenCalled();
        });

        it('should not call selectTileForPlacement if the letter is not in the rack', () => {
            rack.selectLetterTile(randomLetter);
            expect(selectTileForPlacementSpy).not.toHaveBeenCalled();
            expect(rack['selectedTileIndex']).toEqual(ERROR);
        });
        it('should call selectFirstInstanceOfLetter and selectTileForPlacement if isLastOrInvalidSelectedLetter', () => {
            isAnotherLetterSelectedSpy.and.returnValue(false);
            rack['rack'][2].content = randomLetter;
            rack.selectLetterTile(randomLetter);
            expect(selectFirstInstanceOfLetterSpy).toHaveBeenCalledWith([2]);
            expect(selectNextInstanceOfSameLetterSpy).not.toHaveBeenCalled();
            expect(selectTileForPlacementSpy).toHaveBeenCalledWith(rack['rack'][2]);
        });
        it('should call selectFirstInstanceOfLetter and selectTileForPlacement if isAnotherLetterSelected', () => {
            selectTileForPlacementSpy.and.returnValue(false);
            const anotherLetterIndex = 3;
            rack['selectedTileIndex'] = anotherLetterIndex;
            rack['rack'][0].content = randomLetter;
            rack['rack'][2].content = randomLetter;
            rack.selectLetterTile(randomLetter);
            expect(selectFirstInstanceOfLetterSpy).toHaveBeenCalledWith([0, 2]);
            expect(selectNextInstanceOfSameLetterSpy).not.toHaveBeenCalled();
            expect(selectTileForPlacementSpy).toHaveBeenCalledWith(rack['rack'][0]);
        });
        it('should call selectFirstInstanceOfLetter and selectTileForPlacement if we are selecting now the last instance of the letter', () => {
            selectTileForPlacementSpy.and.returnValue(false);
            const lastLetterIndex = 6;
            rack['selectedTileIndex'] = lastLetterIndex;
            rack['rack'][0].content = randomLetter;
            rack['rack'][2].content = randomLetter;
            rack['rack'][lastLetterIndex].content = randomLetter;
            rack.selectLetterTile(randomLetter);
            expect(selectFirstInstanceOfLetterSpy).toHaveBeenCalledWith([0, 2, lastLetterIndex]);
            expect(selectNextInstanceOfSameLetterSpy).not.toHaveBeenCalled();
            expect(selectTileForPlacementSpy).toHaveBeenCalledWith(rack['rack'][0]);
        });
        it('should call selectNextInstanceOfSameLetter if letterIndexes.length>1 && (!isAnotherLetter && isLastOrInvalidLetter', () => {
            const nextLetterIndex = 6;
            const currentLetterIndex = 2;
            rack['selectedTileIndex'] = currentLetterIndex;
            rack['rack'][0].content = randomLetter;
            rack['rack'][currentLetterIndex].content = randomLetter;
            rack['rack'][nextLetterIndex].content = randomLetter;
            rack.selectLetterTile(randomLetter);
            expect(selectFirstInstanceOfLetterSpy).not.toHaveBeenCalled();
            expect(selectNextInstanceOfSameLetterSpy).toHaveBeenCalledWith([0, currentLetterIndex, nextLetterIndex]);
            expect(selectTileForPlacementSpy).toHaveBeenCalledWith(rack['rack'][nextLetterIndex]);
        });
    });
});
