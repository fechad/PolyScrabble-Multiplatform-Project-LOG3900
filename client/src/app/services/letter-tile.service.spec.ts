import { TestBed } from '@angular/core/testing';
import { BOARD_SCALING_RATIO, DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { Dimension } from '@app/classes/dimension';
import { Tile } from '@app/classes/tile';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/constants';
import { LetterTileService } from './letter-tile.service';
import { ERROR } from '@app/constants/rack-constants';

describe('LetterTileService', () => {
    let service: LetterTileService;
    let letterTile: Tile;
    let boardTileWidth: number;
    let boardTileHeight: number;
    let letterRatio: number;
    let tileDimension: Dimension;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LetterTileService);

        letterTile = new Tile();
        boardTileWidth = DEFAULT_WIDTH / DEFAULT_CASE_COUNT;
        boardTileHeight = DEFAULT_HEIGHT / DEFAULT_CASE_COUNT;
        tileDimension = { width: boardTileWidth, height: boardTileHeight };
        letterRatio = BOARD_SCALING_RATIO;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('method tests', () => {
        let drawRectangleSpy: jasmine.Spy;
        let drawBorderSpy: jasmine.Spy;
        let drawLetterSpy: jasmine.Spy;
        let drawPointSpy: jasmine.Spy;
        let setLetterTileParametersSpy: jasmine.Spy;

        beforeEach(() => {
            drawRectangleSpy = spyOn(service, 'drawRectangle');
            drawBorderSpy = spyOn(service, 'drawBorder');
            drawLetterSpy = spyOn(service, 'drawLetter');
            drawPointSpy = spyOn(service, 'drawPoint');
            setLetterTileParametersSpy = spyOn(letterTile, 'setLetterTileParameters');
        });

        it('should call the correct methods on drawLetterTile', () => {
            service.drawLetterTile(letterTile, tileDimension, letterRatio);

            expect(drawRectangleSpy).toHaveBeenCalled();
            expect(drawBorderSpy).toHaveBeenCalledWith(letterTile);
            expect(drawLetterSpy).toHaveBeenCalledWith(letterTile, letterRatio);
            expect(drawPointSpy).toHaveBeenCalledWith(letterTile, letterRatio);
            expect(setLetterTileParametersSpy).toHaveBeenCalledWith(tileDimension, 1);
            expect(setLetterTileParametersSpy).toHaveBeenCalledWith(tileDimension, ERROR);
        });

        it('drawArrow should call the correctMethods', () => {
            service.drawArrow(letterTile, tileDimension, letterRatio);

            expect(drawRectangleSpy).toHaveBeenCalled();
            expect(drawBorderSpy).toHaveBeenCalledWith(letterTile);
            expect(drawLetterSpy).toHaveBeenCalledWith(letterTile, letterRatio);
            expect(setLetterTileParametersSpy).toHaveBeenCalledWith(tileDimension, 1);
            expect(setLetterTileParametersSpy).toHaveBeenCalledWith(tileDimension, ERROR);
        });
    });
});
