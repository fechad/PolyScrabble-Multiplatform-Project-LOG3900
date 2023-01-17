import { TestBed } from '@angular/core/testing';
import { FocusHandlerService } from './focus-handler.service';

describe('FocusHandlerService', () => {
    let service: FocusHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FocusHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
