import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { RackGridService } from '@app/services/rack-grid.service';
describe('GridService', () => {
    let service: RackGridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RackGridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
