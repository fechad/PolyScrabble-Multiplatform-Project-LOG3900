import { TestBed } from '@angular/core/testing';

import { PlacementViewTilesService } from './placement-view-tiles.service';

describe('PlacementViewTilesService', () => {
    let service: PlacementViewTilesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlacementViewTilesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
