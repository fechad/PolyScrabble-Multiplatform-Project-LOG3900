/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { Game } from './interfaces/game';

describe('HttpService tests', () => {
    let httpMock: HttpTestingController;
    let service: HttpService;
    let baseUrl: string;
    let expectedGames: Game[];
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        });
        service = TestBed.inject(HttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
        expectedGames = [
            { date: 'test', period: 'test', player1: 'test1', scorePlayer1: 7, player2: 'test', scorePlayer2: 8, gameType: 'classic', surrender: '' },
        ];
    });
    afterEach(() => {
        httpMock.verify();
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllGames() tests', () => {
        it('should return an Observable<Game[]>', () => {
            service.getAllGames().subscribe((games) => {
                expect(games).toEqual(expectedGames);
            });
            const req = httpMock.expectOne(`${baseUrl}/games`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedGames);
        });
        it('should handle http error safely', () => {
            service.getAllGames().subscribe((response: Game[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/games`);
            expect(req.request.method).toBe('GET');
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle httpClientError safely', () => {
            service.getAllGames().subscribe((response: Game[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/games`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.getAllGames().subscribe((response: Game[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/games`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
    describe('getErrorMessage() tests', () => {
        it('should return the value of the attribute errorMessage', () => {
            // The attribute errorMessage is private and I need to set it to test the getter
            // eslint-disable-next-line dot-notation
            service['errorMessage'] = 'Some error';
            expect(service.getErrorMessage()).toEqual('Some error');
        });
    });
});
