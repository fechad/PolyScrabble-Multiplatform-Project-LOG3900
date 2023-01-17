import { TestBed } from '@angular/core/testing';
import { Dimension } from '@app/classes/dimension';
import { Tile } from '@app/classes/tile';
import { BOARD_SCALING_RATIO, DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/constants';
import { LETTER_SIZE, POINT_OFFSET_RATIO, POINT_SIZE } from '@app/constants/letters-board-constants';
import { DEFAULT_TILE_LETTER_COLOR, DEFAULT_TILE_TEXT_ALIGN, DEFAULT_TILE_TEXT_BASELINE, ERROR } from '@app/constants/rack-constants';
import { TileService } from './tile.service';

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

describe('TileService', () => {
    let service: TileService;
    let letterTile: Tile;
    let boardTileWidth: number;
    let boardTileHeight: number;
    let letterRatio: number;
    let tileDimension: Dimension;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test the gridContext
    let gridContextMock: any;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TileService);

        letterTile = new Tile();
        boardTileWidth = DEFAULT_WIDTH / DEFAULT_CASE_COUNT;
        boardTileHeight = DEFAULT_HEIGHT / DEFAULT_CASE_COUNT;
        tileDimension = { width: boardTileWidth, height: boardTileHeight };
        letterRatio = BOARD_SCALING_RATIO;
        gridContextMock = new GridContextMock();
        service.gridContext = gridContextMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('drawLetterTile tests', () => {
        it('should call the correct methods on drawLetterTile', () => {
            const drawRectangleSpy = spyOn(service, 'drawRectangle');
            const drawBorderSpy = spyOn(service, 'drawBorder');
            const drawLetterSpy = spyOn(service, 'drawLetter');
            const drawPointSpy = spyOn(service, 'drawPoint');

            service.drawLetterTile(letterTile, tileDimension, letterRatio);

            expect(drawRectangleSpy).toHaveBeenCalledWith(letterTile, tileDimension);
            expect(drawBorderSpy).toHaveBeenCalledWith(letterTile);
            expect(drawLetterSpy).toHaveBeenCalledWith(letterTile, letterRatio);
            expect(drawPointSpy).toHaveBeenCalledWith(letterTile, letterRatio);
        });
    });

    describe('removeLetterTile tests', () => {
        it('should call the correct methods on removeLetterTiles', () => {
            const clearRectSpy = spyOn(gridContextMock, 'clearRect');
            service.removeLetterTile(letterTile, tileDimension);
            expect(clearRectSpy).toHaveBeenCalled();
        });
        it('should not clear if the gridContext does not exist', () => {
            const clearRectSpy = spyOn(gridContextMock, 'clearRect');
            gridContextMock = undefined;
            service.gridContext = gridContextMock;
            service.removeLetterTile(letterTile, tileDimension);
            expect(clearRectSpy).not.toHaveBeenCalled();
        });
    });

    describe('drawRectangle tests', () => {
        it('should set the gridContext fillStyle to the letterTile color', () => {
            const fillRectSpy = spyOn(gridContextMock, 'fillRect');

            service.drawRectangle(letterTile, tileDimension);
            expect(service.gridContext.fillStyle).toEqual(letterTile.color);
            expect(fillRectSpy).toHaveBeenCalledWith(letterTile.x, letterTile.y, letterTile.width, letterTile.height);
        });
        it('should call setLetterTileParameters if !letterTile.isPositionSet on drawRectangle', () => {
            const fillRectSpy = spyOn(service.gridContext, 'fillRect');
            const setLetterTileParametersSpy = spyOn(letterTile, 'setLetterTileParameters');
            service.drawRectangle(letterTile, tileDimension);
            expect(setLetterTileParametersSpy).toHaveBeenCalledWith(tileDimension, 1);
            expect(fillRectSpy).toHaveBeenCalledWith(letterTile.x, letterTile.y, letterTile.width, letterTile.height);
        });
        it('should not call setLetterTileParameters if letterTile.isPositionSet on drawRectangle', () => {
            letterTile.isPositionSet = true;
            const fillRectSpy = spyOn(service.gridContext, 'fillRect');
            const setLetterTileParametersSpy = spyOn(letterTile, 'setLetterTileParameters');
            service.drawRectangle(letterTile, tileDimension);
            expect(setLetterTileParametersSpy).not.toHaveBeenCalled();
            expect(fillRectSpy).toHaveBeenCalledWith(letterTile.x, letterTile.y, letterTile.width, letterTile.height);
        });
    });

    describe('drawBorder tets', () => {
        it('should draw the vertical left line correctly', () => {
            const drawLineSpy = spyOn(service, 'drawLine');
            service.drawBorder(letterTile);
            expect(drawLineSpy).toHaveBeenCalledWith(
                { x: letterTile.x, y: letterTile.y },
                { x: letterTile.x, y: letterTile.y + letterTile.height },
                letterTile.border,
            );
        });

        it('should draw the horizontal top line correctly', () => {
            const drawLineSpy = spyOn(service, 'drawLine');
            service.drawBorder(letterTile);
            expect(drawLineSpy).toHaveBeenCalledWith(
                { x: letterTile.x, y: letterTile.y },
                { x: letterTile.x + letterTile.width, y: letterTile.y },
                letterTile.border,
            );
        });

        it('should draw the horizontal bottom line correctly', () => {
            const drawLineSpy = spyOn(service, 'drawLine');
            service.drawBorder(letterTile);
            expect(drawLineSpy).toHaveBeenCalledWith(
                { x: letterTile.x + letterTile.width, y: letterTile.y },
                { x: letterTile.x + letterTile.width, y: letterTile.y + letterTile.height },
                letterTile.border,
            );
        });

        it('should draw the vertical right line correctly', () => {
            const drawLineSpy = spyOn(service, 'drawLine');
            service.drawBorder(letterTile);
            expect(drawLineSpy).toHaveBeenCalledWith(
                { x: letterTile.x, y: letterTile.y + letterTile.height },
                { x: letterTile.x + letterTile.width, y: letterTile.y + letterTile.height },
                letterTile.border,
            );
        });
    });

    describe('drawLine tests', () => {
        it('should call the correct methods on drawLine', () => {
            const beginPathSpy = spyOn(gridContextMock, 'beginPath');
            const moveToSpy = spyOn(gridContextMock, 'moveTo');
            const lineToPathSpy = spyOn(gridContextMock, 'lineTo');
            const strokeSpy = spyOn(gridContextMock, 'stroke');

            const startingPosition = { x: 0, y: 0 };
            const endingPosition = { x: 2, y: 2 };
            service.drawLine(startingPosition, endingPosition, letterTile.border);

            expect(beginPathSpy).toHaveBeenCalled();
            expect(moveToSpy).toHaveBeenCalledWith(startingPosition.x, startingPosition.y);
            expect(lineToPathSpy).toHaveBeenCalledWith(endingPosition.x, endingPosition.y);
            expect(strokeSpy).toHaveBeenCalled();
        });

        it('should set gridContext attributes correctly on drawLine', () => {
            const startingPosition = { x: 0, y: 0 };
            const endingPosition = { x: 2, y: 2 };
            service.drawLine(startingPosition, endingPosition, letterTile.border);

            expect(gridContextMock.strokeStyle).toEqual(letterTile.border.color);
            expect(gridContextMock.lineWidth).toEqual(letterTile.border.width);
        });
    });

    describe('drawLetter tests', () => {
        it('should call the correct methods on drawLetter', () => {
            const fillTextSpy = spyOn(gridContextMock, 'fillText');
            const strokeSpy = spyOn(gridContextMock, 'stroke');
            const xPosition = letterTile.x + letterTile.width / 2;
            const yPosition = letterTile.y + letterTile.height / 2;

            service.drawLetter(letterTile, letterRatio);

            expect(fillTextSpy).toHaveBeenCalledWith(letterTile.content, xPosition, yPosition);
            expect(strokeSpy).toHaveBeenCalled();
        });

        it('should set gridContext attributes correctly on drawLetter', () => {
            service.drawLetter(letterTile, letterRatio);
            expect(gridContextMock.font).toEqual(letterRatio * LETTER_SIZE + 'px system-ui');
            expect(gridContextMock.fillStyle).toEqual(DEFAULT_TILE_LETTER_COLOR);
            expect(gridContextMock.textAlign).toEqual(DEFAULT_TILE_TEXT_ALIGN);
            expect(gridContextMock.textBaseline).toEqual(DEFAULT_TILE_TEXT_BASELINE);
        });
    });

    describe('drawPoint tests', () => {
        it('should call the correct methods on drawPoint', () => {
            const fillTextSpy = spyOn(gridContextMock, 'fillText');
            const strokeSpy = spyOn(gridContextMock, 'stroke');
            const xPosition = letterTile.x + letterTile.width * POINT_OFFSET_RATIO;
            const yPosition = letterTile.y + letterTile.height * POINT_OFFSET_RATIO;

            service.drawPoint(letterTile, letterRatio);

            expect(fillTextSpy).toHaveBeenCalledWith(letterTile.points.toString(), xPosition, yPosition);
            expect(strokeSpy).toHaveBeenCalled();
        });

        it('should set gridContext attributes correctly on drawPoint', () => {
            service.drawPoint(letterTile, letterRatio);
            expect(gridContextMock.font).toEqual(letterRatio * POINT_SIZE + 'px system-ui');
            expect(gridContextMock.fillStyle).toEqual(DEFAULT_TILE_LETTER_COLOR);
            expect(gridContextMock.textAlign).toEqual(DEFAULT_TILE_TEXT_ALIGN);
            expect(gridContextMock.textBaseline).toEqual(DEFAULT_TILE_TEXT_BASELINE);
        });

        it('should not draw the point if the point is lower than 0', () => {
            const strokeSpy = spyOn(gridContextMock, 'stroke');
            letterTile.points = ERROR;
            service.drawPoint(letterTile, letterRatio);

            expect(strokeSpy).not.toHaveBeenCalled();
        });

        it('should not draw the point if the tile has a space in its content', () => {
            const strokeSpy = spyOn(gridContextMock, 'stroke');
            letterTile.content = ' ';
            service.drawPoint(letterTile, letterRatio);

            expect(strokeSpy).not.toHaveBeenCalled();
        });
    });

    it('should return point for one letter with tileScore', () => {
        const expectedResult = 10;
        expect(service.tileScore('z')).toEqual(expectedResult);
    });
    it('should return 0 for no letter is provided with tileScore', () => {
        expect(service.tileScore('')).toEqual(0);
    });
});
