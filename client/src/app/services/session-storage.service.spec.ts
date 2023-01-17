import { TestBed } from '@angular/core/testing';
import { Direction } from '@app/enums/direction';
import { PlacementCommand } from '@app/classes/placement-command';
import { PlayerData } from '@app/interfaces/player-data';
import { SessionStorageService } from './session-storage.service';

describe('LocalStorageService', () => {
    let service: SessionStorageService;
    let playerData: PlayerData;
    let placementCommand: PlacementCommand;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SessionStorageService);
        service.removeItem('key');

        playerData = { socketId: 'socketId', roomName: 'Room0' };
        placementCommand = {
            word: 'Mot',
            xPosition: 3,
            yPosition: 3,
            direction: Direction.Horizontal,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call sessionStorage.setItem on setItem', () => {
        const spy = spyOn(sessionStorage, 'setItem');
        service.setItem('key', JSON.stringify(playerData));
        expect(spy).toHaveBeenCalled();
    });

    it('should call sessionStorage.getItem on getPlayerData', () => {
        const spy = spyOn(sessionStorage, 'getItem');
        service.getPlayerData('key');
        expect(spy).toHaveBeenCalled();
    });

    it('should return the item  on getPlayerData', () => {
        service.setItem('key', JSON.stringify(playerData));

        expect(service.getPlayerData('key')).toEqual(playerData);
    });

    it('should return an empty playerData if there are no playerData', () => {
        expect(service.getPlayerData('key')).toEqual({ socketId: '', roomName: '' });
    });

    it('should call sessionStorage.getItem on getPlacementCommands', () => {
        const spy = spyOn(sessionStorage, 'getItem');
        service.getPlacementCommands('key');
        expect(spy).toHaveBeenCalled();
    });

    it('should return the placementCommands on getPlacementCommands', () => {
        service.setItem('key', JSON.stringify([placementCommand]));

        expect(service.getPlacementCommands('key')).toEqual([placementCommand]);
    });

    it('should return an empty array if there are no placementCommands', () => {
        expect(service.getPlacementCommands('key')).toEqual([]);
    });

    it('should call sessionStorage.removeItem on removeItem', () => {
        const spy = spyOn(sessionStorage, 'removeItem');
        service.removeItem('key');
        expect(spy).toHaveBeenCalled();
    });

    it('should call sessionStorage.clear on clear', () => {
        const spy = spyOn(sessionStorage, 'clear');
        service.clear();
        expect(spy).toHaveBeenCalled();
    });
});
