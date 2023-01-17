import { TestBed } from '@angular/core/testing';
import { BoardGridService } from '@app/services/board-grid.service';

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

describe('GridService', () => {
    let service: BoardGridService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to test the gridContext
    let gridContextMock: any;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BoardGridService);
        gridContextMock = new GridContextMock();
        service.gridContext = gridContextMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('drawBoardLine tests', () => {
        it('should call the correct methods on drawBoardLine', () => {
            const beginPathSpy = spyOn(gridContextMock, 'beginPath');
            const moveToSpy = spyOn(gridContextMock, 'moveTo');
            const lineToPathSpy = spyOn(gridContextMock, 'lineTo');
            const strokeSpy = spyOn(gridContextMock, 'stroke');

            const startingPosition = { x: 0, y: 0 };
            const endingPosition = { x: 2, y: 2 };
            service.drawBoardLine(startingPosition.x, startingPosition.y, endingPosition.x, endingPosition.y);

            expect(beginPathSpy).toHaveBeenCalled();
            expect(moveToSpy).toHaveBeenCalledWith(startingPosition.x, startingPosition.y);
            expect(lineToPathSpy).toHaveBeenCalledWith(endingPosition.x, endingPosition.y);
            expect(strokeSpy).toHaveBeenCalled();
        });
    });
});
